import DataLoader from 'dataloader';
import { Extension, Tag, ReactionCounts, ReactionType, User } from '../types';
import { PoolClient, Pool } from 'pg';
import { findExtensionsForCharts } from './extensions';
import { findTagsForCharts } from './tag';
import { countReactions, findReactionsByChartID } from './reaction';
import { findUsersByUID } from './user';

export interface Loaders {
  usersByUID: DataLoader<string, User>;
  extensionsByChartID: DataLoader<number, Extension[]>;
  tagsByChartID: DataLoader<number, Tag[]>;
  reactionCountsByChartID: DataLoader<number, ReactionCounts>;
  reactionByChartID: DataLoader<number, ReactionType | undefined>;
}

export const makeLoaders = (
  queryable: PoolClient | Pool, uid: string | undefined,
): Loaders => {
  return {
    usersByUID:
      new DataLoader((uids) => findUsersByUID(uids, queryable)),
    extensionsByChartID:
      new DataLoader((chartIDs) => findExtensionsForCharts(chartIDs, queryable)),
    tagsByChartID:
      new DataLoader((chartIDs) => findTagsForCharts(chartIDs, queryable)),
    reactionCountsByChartID:
      new DataLoader((chartIDs) => countReactions(chartIDs, queryable)),
    reactionByChartID:
      new DataLoader((chartIDs: readonly number[]) => {
        if (uid === undefined) {
          return Promise.resolve(new Array(chartIDs.length));
        }
        return findReactionsByChartID(chartIDs, uid, queryable);
      }),
  };
};
