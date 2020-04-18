import {
  User, Chart,
  UserNew, UserUpdate, ChartNew, ChartUpdate, TagNew, ReactionNew, Tag,
} from '../types';
import { insertUserNew, updateUser, deleteUser } from '../repositories/user';
import { Context } from '../util/context';
import { TopLevelRootValue } from '../util/app';
import { deleteChartsForUser, findChartByID, insertNewChart, updateChart, deleteChart } from '../repositories/chart';
import { upsertReactionNew } from '../repositories/reaction';
import { addTagsForChart, unTag, insertNewTags, deleteTag, validateNewTagsScopes } from '../repositories/tag';
import { wrapTopLevelOp, Resolver } from './resolverUtils';
import { addExtensionsForChart, removeExtensionsForChart } from '../repositories/extensions';
import { chartNotFoundError, forbiddenResourceOpError } from '../util/errors';

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
  tagID: number;
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
  addExtensions: Resolver<AddRemoveExtensionsArgs, Chart>;
  removeExtensions: Resolver<AddRemoveExtensionsArgs, Chart>;
  createTags: Resolver<CreateTagArgs, Tag[]>;
  deleteTag: Resolver<DeleteTagArgs, void>;
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
  await upsertReactionNew(args.reactionNew, context.db);
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
  const chart = await findChartByID(args.chartUpdate.id, context.uid, context.db);
  if (!chart) {
    throw chartNotFoundError(args.chartUpdate.id);
  }
  return updateChart(args.chartUpdate, context.uid, context.db);
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
  await unTag(args.chartID, args.tagID, context.uid, context.db);
  return chart;
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
  return insertNewTags(validateNewTagsScopes(args.tagNews, uid), uid, db);
});

M.deleteTag = wrapTopLevelOp(async (
  _obj: TopLevelRootValue, args: DeleteTagArgs, context: Context): Promise<void> => {
  await deleteTag(args.tagID, context.uid, context.db);
});

export default M;
