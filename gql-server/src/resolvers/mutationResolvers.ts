import {
  User, Chart,
  UserNew, UserUpdate, ChartNew, ChartUpdate, TagNew, ReactionNew,
} from '../types';
import { createUser, updateUser, deleteUser } from '../repositories/user';
import { Context } from '../util/context';
import { TopLevelRootValue } from '../util/app';
import { deleteChartsForUser, findChartByID, createNewChart, updateChart, deleteChart } from '../repositories/chart';
import { createReaction } from '../repositories/reaction';
import { addTagsForChart, unTag } from '../repositories/tag';
import { wrapTopLevelOp, Resolver } from './resolverUtils';
import { addExtensionsForChart, removeExtensionsForChart } from '../repositories/extensions';
import { chartNotFoundError } from '../util/errors';

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

interface MutationResolvers {
  createAccount: Resolver<CreateAccountArgs, User>;
  updateAccount: Resolver<UpdateAccountArgs, User>;
  deleteAccount: Resolver<{}, void>;
  react: Resolver<ReactArgs, Chart>;
  createChart: Resolver<CreateChartArgs, Chart>;
  updateChart: Resolver<UpdateChartArgs, Chart>;
  deleteChart: Resolver<DeleteChartArgs, void>;
  addTag: Resolver<AddTagArgs, Chart>;
  unTag: Resolver<UnTagArgs, Chart>;
  addExtensions: Resolver<AddRemoveExtensionsArgs, Chart>;
  removeExtensions: Resolver<AddRemoveExtensionsArgs, Chart>;
}

const M: Partial<MutationResolvers> = {};

M.createAccount = wrapTopLevelOp(
  async (_obj: TopLevelRootValue, args: CreateAccountArgs, context: Context): Promise<User> => {
  return createUser(args.newUser, context.uid, context.db);
});

M.updateAccount = wrapTopLevelOp(async (
  _obj: TopLevelRootValue, args: UpdateAccountArgs, context: Context): Promise<User> => {
  return updateUser(args.userUpdate, context.uid, context.db);
});

M.deleteAccount = wrapTopLevelOp(
  async (_obj: TopLevelRootValue, _args: {}, context: Context): Promise<void> => {
  await deleteChartsForUser(context.uid, context.db);
  await deleteUser(context.uid, context.db);
});

M.react = wrapTopLevelOp(async (_obj: TopLevelRootValue, args: ReactArgs, context: Context): Promise<Chart> => {
  await createReaction(args.reactionNew, context.db);
  const chart = await findChartByID(args.reactionNew.chartID, context.uid, context.db);
  return chart as Chart;
});

M.createChart = wrapTopLevelOp(async (
  _obj: TopLevelRootValue, args: CreateChartArgs, context: Context) => {
    const chart = await createNewChart(args.chartNew, context.uid, context.db);
    if (args.chartNew.tags) {
      await addTagsForChart(chart.id, args.chartNew.tags, context.uid, context.db);
    }
    if (args.chartNew.extensionIDs) {
      await addExtensionsForChart(chart.id, args.chartNew.extensionIDs, context.db);
    }
  return chart;
});

M.updateChart = wrapTopLevelOp(async (
  _obj: TopLevelRootValue, args: UpdateChartArgs, context: Context): Promise<Chart> => {
  return updateChart(args.chartUpdate, context.uid, context.db);
});

M.deleteChart = wrapTopLevelOp(async (
  _obj: TopLevelRootValue, args: DeleteChartArgs, context: Context): Promise<void> => {
  await deleteChart(args.chartID, context.uid, context.db);
});

M.addTag = wrapTopLevelOp(async (
  _obj: TopLevelRootValue, args: AddTagArgs, context: Context,
): Promise<Chart> => {
  const chart = await findChartByID(args.chartID, context.uid, context.db);
  if (!chart) {
    throw chartNotFoundError(args.chartID);
  }
  await addTagsForChart(chart.id, args.tags, context.uid, context.db);
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

export default M;
