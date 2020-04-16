import DataLoader from 'dataloader';
import { Extension, Tag, ReactionCounts } from '../types';
import { PoolClient } from 'pg';
import { findExtensionsForCharts } from './extensions';
import { findTagsForCharts } from './tag';
import { countReactions } from './reaction';

export interface Loaders {
  extensionsByChartID: DataLoader<number, Extension[]>;
  tagsByChartID: DataLoader<number, Tag[]>;
  reactionCountsByChartID: DataLoader<number, ReactionCounts>;
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
});
