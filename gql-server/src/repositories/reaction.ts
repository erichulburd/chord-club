import { PoolClient } from 'pg';
import { ReactionNew, ReactionCounts, ReactionType } from '../types';
import { groupBy } from 'lodash';

export const createReaction = async (reaction: ReactionNew, client: PoolClient) => {
  await client.query(`
    INSERT INTO reaction (chart_id, user_id, reaction_type)
      VALUES ($1, $2)
  `, [reaction.chartID, reaction.userID, reaction.reactionType.toLowerCase()]);
};

interface ReactionCountsRow {
  chartID: number;
  reactionType: ReactionType;
  ct: number;
}

const makeReactionCounts = (a: ReactionCountsRow[]): ReactionCounts => ({
  stars: a.find((e) => e.reactionType === ReactionType.Star)?.ct || 0,
  flags: a.find((e) => e.reactionType === ReactionType.Flag)?.ct || 0,
});

export const countReactions = async (
  chartIDs: readonly number [] | number[], client: PoolClient) => {
  const result = await client.query(`
    SELECT chart_id AS chartID, reaction_type AS reactionType, COUNT(chart_id, reaction_type) AS ct
      FROM reaction
      WHERE chart_id IN $1
      GROUP BY chart_id, reaction_type
  `, [chartIDs]);
  const counts: ReactionCountsRow[] = result.rows;
    const countsByChartID = groupBy(counts, 'chartID');
  if (Array.isArray(chartIDs)) {
    return chartIDs.map((chartID) => makeReactionCounts(countsByChartID[chartID] || []));
  }
  return chartIDs.map((chartID) => makeReactionCounts(countsByChartID[chartID] || []));
};
