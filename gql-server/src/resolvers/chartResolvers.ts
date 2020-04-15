import { Chart, Extension, Tag, ReactionCounts } from '../types';
import { Context } from '../util/context';
import { Resolver } from './resolverUtils';


const extensions: Resolver<{}, Extension[], Chart> = async (
  chart: Chart, args: {}, context: Context,
): Promise<Extension[]> => {
  return context.loaders.extensionsByChartID.load(chart.id);
};

const tags: Resolver<{}, Tag[], Chart> = async (
  chart: Chart, args: {}, context: Context,
): Promise<Tag[]> => {
  return context.loaders.tagsByChartID.load(chart.id);
};

const reactionCounts: Resolver<{}, ReactionCounts, Chart> = async (
  chart: Chart, args: {}, context: Context,
): Promise<ReactionCounts> => {
  return context.loaders.reactionCountsByChartID.load(chart.id);
};

export default {
  extensions, tags, reactionCounts,
};
