import { Chart, Extension, Tag, ReactionCounts, ReactionType } from '../types';
import { Context } from '../util/context';
import { Resolver } from './resolverUtils';


export const extensions: Resolver<{}, Extension[], Chart> = async (
  chart: Chart, args: {}, context: Context,
): Promise<Extension[]> => {
  return context.loaders.extensionsByChartID.load(chart.id);
};

export const tags: Resolver<{}, Tag[], Chart> = async (
  chart: Chart, args: {}, context: Context,
): Promise<Tag[]> => {
  return context.loaders.tagsByChartID.load(chart.id);
};

export const reactionCounts: Resolver<{}, ReactionCounts, Chart> = async (
  chart: Chart, args: {}, context: Context,
): Promise<ReactionCounts> => {
  return context.loaders.reactionCountsByChartID.load(chart.id);
};

export const userReactionType: Resolver<{}, ReactionType | undefined, Chart> = async (
  chart: Chart, _args: {}, context: Context,
): Promise<ReactionType | undefined> => {
  return context.loaders.reactionByChartID.load(chart.id);
};
