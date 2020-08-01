import {
  User, Chart,
  UserNew, UserUpdate, ChartNew, ChartUpdate, TagNew, ReactionNew, Tag, NewInvitation, NewPolicy, Policy, CreateInvitationResponse,
} from '../types';
import { insertUserNew, updateUser, deleteUser } from '../repositories/user';
import { Context } from '../util/context';
import { TopLevelRootValue } from '../util/app';
import { deleteChartsForUser, findChartByID, insertNewChart, updateChart, deleteChart, findChartsByID } from '../repositories/chart';
import { upsertReactionNew, findReactionsByChartID, deleteReactionNew } from '../repositories/reaction';
import { addTagsForChart, unTag, insertNewTags, deleteTag, reconcileChartTags, updateTagPositions, findTagByID } from '../repositories/tag';
import { wrapTopLevelOp, Resolver, assertResourceOwner } from './resolverUtils';
import { addExtensionsForChart, removeExtensionsForChart, reconcileChartExtensions } from '../repositories/extensions';
import { chartNotFoundError, forbiddenResourceOpError, invalidTagPositionUpdate, notFoundError } from '../util/errors';
import { insertInvitations, deleteInvitation, findInvitationByID } from '../repositories/invitation';
import { makeNewPolicyFromInvitation, insertPolicies, deletePolicy, findPolicyByID, findTagPolicyByTagID } from '../repositories/policy';
import * as tokens from '../util/tokens';
import { invalidInvitationTokenError } from '../util/errors';
import { SignOptions } from 'jsonwebtoken';
import moment from 'moment';

interface CreateAccountArgs {
  newUser: UserNew;
}

interface UpdateAccountArgs {
  userUpdate: UserUpdate;
}

interface ReactArgs {
  reactionNew: ReactionNew;
}

interface CreateChartArgs {
  chartNew: ChartNew;
}

interface UpdateChartArgs {
  chartUpdate: ChartUpdate;
}

interface DeleteChartArgs {
  chartID: number;
}

interface AddTagArgs {
  chartID: number;
  tags: TagNew[];
}

interface UnTagArgs {
  chartID: number;
  tagIDs: number[];
}

interface SetTagPositionArgs {
  tagID: number;
  chartIDs: number[];
  positions: number[];
}

interface AddRemoveExtensionsArgs {
  chartID: number;
  extensionIDs: number[];
}

interface CreateTagArgs {
  tagNews: TagNew[];
}

interface DeleteTagArgs {
  tagID: number;
}

interface DeleteTagAccessPolicyArgs {
  tagID: number;
}

interface CreateInvitationArgs {
  invitation: NewInvitation;
  tokenExpirationHours?: number;
}

interface DeleteInvitationArgs {
  invitationID: number;
}

interface AcceptInvitationArgs {
  token: string;
}

interface CreatePolicyArgs {
  policy: NewPolicy;
}

interface DeletePolicyArgs {
  policyID: number;
}

interface MutationResolvers {
  createUser: Resolver<CreateAccountArgs, User>;
  updateUser: Resolver<UpdateAccountArgs, User>;
  deleteUser: Resolver<{}, void>;
  react: Resolver<ReactArgs, Chart>;
  createChart: Resolver<CreateChartArgs, Chart>;
  updateChart: Resolver<UpdateChartArgs, Chart | undefined>;
  deleteChart: Resolver<DeleteChartArgs, void>;
  addTags: Resolver<AddTagArgs, Chart>;
  unTag: Resolver<UnTagArgs, Chart>;
  setTagPositions: Resolver<SetTagPositionArgs, Chart[]>;
  addExtensions: Resolver<AddRemoveExtensionsArgs, Chart>;
  removeExtensions: Resolver<AddRemoveExtensionsArgs, Chart>;
  createTags: Resolver<CreateTagArgs, Tag[]>;
  deleteTag: Resolver<DeleteTagArgs, void>;
  deleteTagAccessPolicy: Resolver<DeleteTagArgs, void>;

  // Invitations
  createInvitation: Resolver<CreateInvitationArgs, CreateInvitationResponse>;
  deleteInvitation: Resolver<DeleteInvitationArgs, void>;
  acceptInvitation: Resolver<AcceptInvitationArgs, Tag>;

  // Policies
  createPolicy: Resolver<CreatePolicyArgs, Policy>;
  deletePolicy: Resolver<DeletePolicyArgs, void>;
}

const M: Partial<MutationResolvers> = {};

M.createUser = wrapTopLevelOp(
  async (_obj: TopLevelRootValue, args: CreateAccountArgs, context: Context): Promise<User> => {
  return insertUserNew(args.newUser, context.uid, context.db);
});

M.updateUser = wrapTopLevelOp(async (
  _obj: TopLevelRootValue, args: UpdateAccountArgs, context: Context): Promise<User> => {
  return updateUser(args.userUpdate, context.uid, context.db);
});

M.deleteUser = wrapTopLevelOp(
  async (_obj: TopLevelRootValue, _args: {}, context: Context): Promise<void> => {
  await deleteChartsForUser(context.uid, context.db);
  await deleteUser(context.uid, context.db);
});

M.react = wrapTopLevelOp(async (_obj: TopLevelRootValue, args: ReactArgs, context: Context): Promise<Chart> => {
  if (args.reactionNew.uid !== context.uid) {
    throw forbiddenResourceOpError();
  }
  const chart = await findChartByID(args.reactionNew.chartID, context.uid, context.db);
  if (!chart) {
    throw chartNotFoundError(args.reactionNew.chartID);
  }
  const rxns = await findReactionsByChartID([args.reactionNew.chartID], context.uid, context.db);
  if (!rxns[0] || rxns[0] !== args.reactionNew.reactionType) {
    await upsertReactionNew(args.reactionNew, context.db);
  } else {
    await deleteReactionNew(args.reactionNew.chartID, context.uid, context.db);
  }
  return chart as Chart;
});

M.createChart = wrapTopLevelOp(async (
  _obj: TopLevelRootValue, args: CreateChartArgs, context: Context) => {
    const chart = await insertNewChart(args.chartNew, context.uid, context.db);
    if (args.chartNew.tags) {
      await addTagsForChart(chart, args.chartNew.tags, context.uid, context.db);
    }
    if (args.chartNew.extensionIDs) {
      await addExtensionsForChart(chart.id, args.chartNew.extensionIDs, context.db);
    }
  return chart;
});

M.updateChart = wrapTopLevelOp(async (
  _obj: TopLevelRootValue, args: UpdateChartArgs, context: Context): Promise<Chart | undefined> => {
  let chart = await findChartByID(args.chartUpdate.id, context.uid, context.db);
  if (!chart) {
    throw chartNotFoundError(args.chartUpdate.id);
  } else if (chart.createdBy !== context.uid) {
    throw forbiddenResourceOpError();
  }
  const [db, txManager] = await context.dbClientManager.newConnection();
  const tx = await txManager.begin();
  try {
    chart = await updateChart(args.chartUpdate, context.uid, db);
    if (args.chartUpdate.tags) {
      const existingTags = await context.loaders.tagsByChartID.load(chart.id);
      await reconcileChartTags(chart, args.chartUpdate.tags, existingTags, db);
    }
    if (args.chartUpdate.extensionIDs) {
      const existingExtensions = await context.loaders.extensionsByChartID.load(chart.id);
      const existingExtensionIDs = existingExtensions.map(e => e.id);
      await reconcileChartExtensions(chart, args.chartUpdate.extensionIDs, existingExtensionIDs, db);
    }
    await txManager.commit(tx);
    await context.dbClientManager.releaseClient(db);
    return chart;
  } catch (err) {
    await txManager.rollbackTx(tx);
    await context.dbClientManager.releaseClient(db);
    throw err;
  }
});

M.deleteChart = wrapTopLevelOp(async (
  _obj: TopLevelRootValue, args: DeleteChartArgs, context: Context): Promise<void> => {
  const chart = await findChartByID(args.chartID, context.uid, context.db);
  if (!chart) {
    throw chartNotFoundError(args.chartID);
  }
  await deleteChart(args.chartID, context.uid, context.db);
});

M.addTags = wrapTopLevelOp(async (
  _obj: TopLevelRootValue, args: AddTagArgs, context: Context,
): Promise<Chart> => {
  const chart = await findChartByID(args.chartID, context.uid, context.db);
  if (!chart) {
    throw chartNotFoundError(args.chartID);
  }
  await addTagsForChart(chart, args.tags, context.uid, context.db);
  return chart;
});

M.unTag = wrapTopLevelOp(async (
  _obj: TopLevelRootValue, args: UnTagArgs, context: Context): Promise<Chart> => {
  const chart = await findChartByID(args.chartID, context.uid, context.db);
  if (!chart) {
    throw chartNotFoundError(args.chartID);
  }
  await unTag(args.chartID, args.tagIDs, context.uid, context.db);
  return chart;
});

M.setTagPositions = wrapTopLevelOp(async (
  _obj: TopLevelRootValue, args: SetTagPositionArgs, context: Context): Promise<Chart[]> => {
  const { tagID, chartIDs, positions } = args;
  // within transaction.
  // const tagScopes = [BaseScopes.Public, context.uid];
  const tag = await findTagByID(tagID, context.uid, context.db);
  if (!tag || tag.createdBy !== context.uid) {
    throw forbiddenResourceOpError();
  }
  if (chartIDs.length !== positions.length) {
    throw invalidTagPositionUpdate();
  }

  const [client, txManager] = await context.dbClientManager.newConnection();
  const tx = await txManager.begin();
  try {
    await updateTagPositions(tagID, chartIDs, positions, client);
    await txManager.commit(tx);
  } catch (err) {
    await txManager.rollbackTx(tx);
    throw err;
  }
  // return findChartsByID(chartIDs, [context.uid, BaseScopes.Public], context.db);
  return findChartsByID(chartIDs, context.uid, context.db);
});

M.addExtensions = wrapTopLevelOp(async (
  _obj: TopLevelRootValue, args: AddRemoveExtensionsArgs, context: Context,
): Promise<Chart> => {
  const chart = await findChartByID(args.chartID, context.uid, context.db);
  if (!chart) {
    throw chartNotFoundError(args.chartID);
  }
  await addExtensionsForChart(chart.id, args.extensionIDs, context.db);
  return chart;
});

M.removeExtensions = wrapTopLevelOp(async (
  _obj: TopLevelRootValue, args: AddRemoveExtensionsArgs, context: Context): Promise<Chart> => {
  const chart = await findChartByID(args.chartID, context.uid, context.db);
  if (!chart) {
    throw chartNotFoundError(args.chartID);
  }
  await removeExtensionsForChart(args.chartID, args.extensionIDs, context.db);
  return chart;
});

M.createTags = wrapTopLevelOp(async (
  _obj: TopLevelRootValue, args: CreateTagArgs, context: Context,
): Promise<Tag[]> => {
  const { uid, db } = context;
  return insertNewTags(args.tagNews, uid, db);
});

M.deleteTag = wrapTopLevelOp(async (
  _obj: TopLevelRootValue, args: DeleteTagArgs, context: Context): Promise<void> => {
  await deleteTag(args.tagID, context.uid, context.db);
});

M.deleteTagAccessPolicy = wrapTopLevelOp(async (
  _obj: TopLevelRootValue, args: DeleteTagAccessPolicyArgs, context: Context): Promise<void> => {
  const policy = await findTagPolicyByTagID(args.tagID, context.uid, context.db);
  if (!policy) {
    throw notFoundError({ args, op: 'deleteTagAccessPolicy' });
  }
  await deletePolicy(policy.id, context.db);
});

// Invitations
M.createInvitation = wrapTopLevelOp(async (
  _obj: TopLevelRootValue, args: CreateInvitationArgs, context: Context): Promise<CreateInvitationResponse> => {
  await assertResourceOwner(context.uid, args.invitation, context.db);
  const invitations = await insertInvitations([args.invitation], context.uid, context.db);
  const tokenOpts: Partial<SignOptions> = {};
  if (args.tokenExpirationHours) {
    tokenOpts.expiresIn = args.tokenExpirationHours * 3600;
  }
  const token = await tokens.sign({ invitationID: invitations[0].id.toString() }, tokenOpts);
  return {token};
});

M.deleteInvitation = wrapTopLevelOp(async (
  _obj: TopLevelRootValue, args: DeleteInvitationArgs, context: Context): Promise<void> => {
  const invitation = await findInvitationByID(args.invitationID, context.db);
  if (invitation === undefined) {
    throw notFoundError(args);
  }
  await assertResourceOwner(context.uid, invitation, context.db);
  await deleteInvitation(args.invitationID, context.db);
});

M.acceptInvitation = wrapTopLevelOp(async (
  _obj: TopLevelRootValue, args: AcceptInvitationArgs, context: Context): Promise<Tag> => {
    let payload:tokens.InvitationTokenPayload = { invitationID: 0 };
    try {
      payload = await tokens.parse<tokens.InvitationTokenPayload>(args.token);
    } catch (err) {
      context.logger.error(err);
      throw invalidInvitationTokenError('failed to parse token');
    }

    const invitation = await findInvitationByID(payload.invitationID, context.db);
    if (invitation === undefined) {
      context.logger.error(
        `could not find invitation for token with invitationID ${payload.invitationID}`);
      throw invalidInvitationTokenError('valid invitation not found');
    }

    // Only create the policy IF request is for a different user.
    const tag = await findTagByID(
      invitation.resourceID, invitation.createdBy || '', context.db);
    if (!tag) {
      context.logger.error(`could not find tag for token with ${payload.invitationID}`);
      throw invalidInvitationTokenError('tag not found');
    } else if (tag.createdBy === context.uid) {
      return tag;
    }
    // and there is a no existing policy with a later expiresAt timestamp.
    const existingPolicy = await findTagPolicyByTagID(
      invitation.resourceID, context.uid, context.db);
    if (existingPolicy) {
      if (!existingPolicy.expiresAt) {
        return tag;
      } else if (invitation.expiresAt && moment(existingPolicy.expiresAt).isAfter(moment(invitation.expiresAt))) {
        return tag;
      }
      await deletePolicy(existingPolicy.id, context.db);
    }

    const newPolicy = makeNewPolicyFromInvitation(context.uid, invitation) as NewPolicy;
    await insertPolicies([newPolicy], invitation.createdBy || '', context.db);
    return tag;
});

// Policies
M.createPolicy = wrapTopLevelOp(async (
  _obj: TopLevelRootValue, args: CreatePolicyArgs, context: Context): Promise<Policy> => {
    await assertResourceOwner(context.uid, args.policy, context.db);
    const policies = await insertPolicies([args.policy], context.uid, context.db);
    return policies[0];
});

M.deletePolicy = wrapTopLevelOp(async (
  _obj: TopLevelRootValue, args: DeletePolicyArgs, context: Context): Promise<void> => {
    const policy = await findPolicyByID(args.policyID, context.db);
    if (policy === undefined) {
      throw notFoundError(args);
    }
    if (policy.uid !== context.uid) {
      await assertResourceOwner(context.uid, policy, context.db);
    }
    await deletePolicy(args.policyID, context.db);
});

export default M;
