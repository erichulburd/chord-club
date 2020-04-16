import DataLoader from 'dataloader';
import { Extension, Tag, ReactionCounts, ReactionType } from '../types';
import { PoolClient } from 'pg';
import { findExtensionsForCharts } from './extensions';
import { findTagsForCharts } from './tag';
import { countReactions, findReactionsByChartID } from './reaction';

export interface Loaders {
  extensionsByChartID: DataLoader<number, Extension[]>;
  tagsByChartID: DataLoader<number, Tag[]>;
  reactionCountsByChartID: DataLoader<number, ReactionCounts>;
  reactionByChartID: DataLoader<number, ReactionType | undefined>;
}

export const makeLoaders = (
  client: PoolClient, uid: string | undefined,
): Loaders => ({
  extensionsByChartID:
    new DataLoader((chartIDs) => findExtensionsForCharts(chartIDs, client)),
  tagsByChartID:
    new DataLoader((chartIDs) => findTagsForCharts(chartIDs, uid, client)),
  reactionCountsByChartID:
    new DataLoader((chartIDs) => countReactions(chartIDs, client)),
  reactionByChartID:
    new DataLoader((chartIDs: readonly number[]) => {
      if (uid === undefined) {
        return Promise.resolve(new Array(chartIDs.length));
      }
      return findReactionsByChartID(chartIDs, uid, client);
    }),
});
