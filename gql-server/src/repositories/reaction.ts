import { PoolClient } from 'pg';
import { ReactionNew, ReactionCounts, ReactionType, Reaction } from '../types';
import { groupBy } from 'lodash';
import { makeDBFields, makeSelectFields, makeDBDataToObject } from './db';
import { pgReactionUniqueError, invalidChartReactionError } from '../util/errors';

const attrs = [
  'reactionType', 'chartID', 'createdBy', 'createdAt',
];
const dbFields = makeDBFields(attrs);
const _selectFields = makeSelectFields(dbFields, 'u');
const _dbDataToReaction = makeDBDataToObject<Reaction>(attrs, 'Reaction');

export const upsertReactionNew = async (reaction: ReactionNew, client: PoolClient) => {
  try {
    await client.query(`
      INSERT INTO reaction (chart_id, created_by, reaction_type)
        VALUES ($1, $2, $3)
        ON CONFLICT (created_by, chart_id) DO
        UPDATE SET reaction_type = EXCLUDED.reaction_type
    `, [reaction.chartID, reaction.uid, reaction.reactionType]);
  } catch (err) {
    if (pgReactionUniqueError.test(err.message)) {
      throw invalidChartReactionError(reaction.chartID);
    }
    throw err;
  }
};

export const deleteReactionNew = async (chartID: number, uid: string, client: PoolClient) => {
  await client.query(`
    DELETE FROM reaction WHERE chart_id = $1 AND created_by = $2
  `, [chartID, uid]);
};

interface ReactionCountsRow {
  chart_id: number;
  reaction_type: ReactionType;
  ct: string;
}

const makeReactionCounts = (a: ReactionCountsRow[]): ReactionCounts => ({
  stars: parseInt(a.find((e) => (e.reaction_type === ReactionType.Star))?.ct || '0', 10),
  flags: parseInt(a.find((e) => (e.reaction_type === ReactionType.Flag))?.ct ||'0', 10),
});

export const countReactions = async (
  chartIDs: readonly number [] | number[], client: PoolClient) => {
  const result = await client.query(`
    SELECT chart_id, reaction_type, COUNT(*) AS ct
      FROM reaction
      WHERE chart_id = ANY ($1)
      GROUP BY chart_id, reaction_type
  `, [chartIDs]);
  const counts: ReactionCountsRow[] = result.rows;
  const countsByChartID = groupBy(counts, 'chart_id');
  if (Array.isArray(chartIDs)) {
    return chartIDs.map((chartID) => makeReactionCounts(countsByChartID[chartID] || []));
  }
  return chartIDs.map((chartID) => makeReactionCounts(countsByChartID[chartID] || []));
};

interface ReactionRow {
  chart_id: number;
  reaction_type: ReactionType;
}

const getReactionForChartIDs = (groups: { [key: number]: (ReactionRow | undefined)[] }) =>
  (chartID: number): ReactionType | undefined => {
    const chartReactions = groups[chartID];
    const chartReaction = chartReactions?.length > 0 ? chartReactions[0] : undefined;
    return chartReaction?.reaction_type;
  };

export const findReactionsByChartID = async (
  chartIDs: readonly number [] | number[], uid: string, client: PoolClient): Promise<(ReactionType | undefined)[]> => {
  const result = await client.query(`
    SELECT chart_id, reaction_type
      FROM reaction
      WHERE chart_id = ANY ($1) AND created_by = $2
  `, [chartIDs, uid]);
  const reactions: ReactionRow[] = result.rows;
  const groups: { [key: number]: (ReactionRow | undefined)[] } = groupBy(reactions, 'chart_id');
  const mapper = getReactionForChartIDs(groups);
  if (Array.isArray(chartIDs)) {
    return chartIDs.map(mapper);
  }
  return chartIDs.map(mapper);
};
