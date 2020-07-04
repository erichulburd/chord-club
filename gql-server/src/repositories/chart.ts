import { ChartQuery, Chart, ChartQueryOrder, ChartNew, ChartUpdate, ChartType } from '../types';
import { omit } from 'lodash';
import {
  prepareDBUpdate, makeDBFields, makeSelectFields,
  makeDBDataToObject,
  prepareDBInsert,
  Queryable
} from './db';

const attrs = [
  'id', 'audioURL', 'audioLength', 'imageURL', 'hint', 'name', 'description', 'abc',
  'chartType', 'bassNote', 'root', 'quality', 'createdAt', 'createdBy',
  'updatedAt',
];
const dbFields = makeDBFields(attrs);
const selectFields = makeSelectFields(dbFields, 'c');
const dbDataToChart = makeDBDataToObject<Chart>(attrs, 'Chart');

interface AfterQuery {
  after: number;
}

interface BaseChartQuery {
  chartTypes: string[];
  orderBy: string;
  limit: number;
  direction: 'ASC' | 'DESC';
}

interface BaseChartQueryAfter extends BaseChartQuery, AfterQuery {}

interface ChartQueryByTags extends BaseChartQuery {
  tagIDs: number[];
}

interface ChartQueryByTagsAfter extends ChartQueryByTags, AfterQuery {}

export const findChartByID = async (id: number, uid: string, queryable: Queryable) => {
  const result = await queryable.query(`
    SELECT
      ${selectFields}
      FROM chart c
        LEFT OUTER JOIN chart_policies_for_uid($2) cp ON c.id = cp.chart_id
      WHERE c.id = $1 AND (c.created_by = $2 OR cp.policy_action IS NOT NULL)
  `, [id, uid]);
  if (result.rows.length < 1) {
    return undefined;
  }
  return dbDataToChart(result.rows[0]) as Chart;
};

export const findChartsByID = async (chartIDs: number[], uid: string, queryable: Queryable) => {
  const result = await queryable.query(`
    SELECT
      ${selectFields}
      FROM chart c
        LEFT OUTER JOIN chart_policies_for_uid($2) cp ON c.id = cp.chart_id
      WHERE c.id = ANY ($1) AND (c.created_by = $2 OR cp.policy_action IS NOT NULL)
  `, [chartIDs, uid]);
  return result.rows.map(dbDataToChart);
};

const findRandomCharts = async (chartTypes: ChartType[], uid: string, limit: number, queryable: Queryable) => {
  const result = await queryable.query(`
  WITH selection AS (
    SELECT
    ${selectFields}
    FROM chart c
      LEFT OUTER JOIN chart_policies_for_uid($2) cp ON c.id = cp.chart_id
      WHERE c.chart_type = ANY ($1) AND (c.created_by = $2 OR cp.policy_action IS NOT NULL)
  )
  SELECT ${selectFields} FROM selection c ORDER BY FLOOR(RANDOM() * $3) LIMIT $3
  `, [chartTypes, uid, limit]);
  const charts = result.rows.map(dbDataToChart) as Chart[];
  return charts;
};

const findRandomChartsByTagIDs = async (tagIDs: number[], chartTypes: ChartType[], uid: string, limit: number, queryable: Queryable) => {
  const result = await queryable.query(`
  WITH selection AS (
    SELECT
    ${selectFields}
    FROM chart_tag ct
      LEFT OUTER JOIN chart_policies_for_uid($2) cp ON ct.chart_id = cp.chart_id
      INNER JOIN chart c ON ct.chart_id = c.id
      INNER JOIN tag t ON ct.tag_id = t.id
    WHERE t.id = ANY ($1) AND c.chart_type = ANY ($4) AND (c.created_by = $2 OR cp.policy_action IS NOT NULL)
    LIMIT $3
  )
  SELECT * FROM selection c ORDER BY FLOOR(RANDOM() * $3) LIMIT $3
  `, [tagIDs, uid, limit, chartTypes]);
  const charts = result.rows.map(dbDataToChart) as Chart[];
  return charts;
};

const findCharts = async (query: BaseChartQuery, uid: string, queryable: Queryable) => {
  const result = await queryable.query(`
  SELECT
    ${selectFields}, cp.policy_action
  FROM chart c
    LEFT OUTER JOIN chart_policies_for_uid($2) cp ON c.id = cp.chart_id
    WHERE c.chart_type = ANY ($1)
      AND (c.created_by = $2 OR cp.policy_action IS NOT NULL)
    ORDER BY $3, c.id ${query.direction}
  LIMIT $4
  `, [query.chartTypes, uid, query.orderBy, query.limit]);
  return result.rows.map(dbDataToChart) as Chart[];
};

const findChartsAfter = async (
  query: BaseChartQueryAfter, uid: string, queryable: Queryable) => {

  const result = await queryable.query(`
  WITH ranks AS (
    SELECT
      ${selectFields},
      RANK() OVER (
        ORDER BY $1, c.id ${query.direction}
      ) rank_number
    FROM chart c
      LEFT OUTER JOIN chart_policies_for_uid($2) cp ON c.id = cp.chart_id
    WHERE c.chart_type = ANY ($5) AND (c.created_by = $2 OR cp.policy_action IS NOT NULL)
  )
  SELECT * FROM ranks
  WHERE rank_number > (SELECT rank_number FROM ranks WHERE id = $3)
  ORDER BY $1, id ${query.direction}
  LIMIT $4
  `, [query.orderBy, uid, query.after, query.limit, query.chartTypes]);
  return result.rows.map(dbDataToChart) as Chart[];
};

const findChartsByTags = async (
  query: ChartQueryByTags, uid: string, queryable: Queryable,
) => {
  const result = await queryable.query(`
  SELECT
    ${selectFields}
  FROM chart_tag ct
    LEFT OUTER JOIN chart_policies_for_uid($2) cp ON ct.chart_id = cp.chart_id
    INNER JOIN chart c ON ct.chart_id = c.id
    INNER JOIN tag t ON ct.tag_id = t.id
  WHERE t.id = ANY ($1) AND c.chart_type = ANY ($5) AND (c.created_by = $2 OR cp.policy_action IS NOT NULL)
  ORDER BY $3, c.id ${query.direction}
  LIMIT $4
  `, [query.tagIDs, uid, query.orderBy, query.limit, query.chartTypes]);
  return result.rows.map(dbDataToChart) as Chart[];
};

const findChartsByTagsAfter = async (
  query: ChartQueryByTagsAfter, uid: string, queryable: Queryable,
) => {
  const result = await queryable.query(`
  WITH ranks AS (
    SELECT
      ${selectFields},
      ct.tag_position,
      RANK() OVER (
        ORDER BY $4, c.id ${query.direction}
      ) rank_number
    FROM chart c
      LEFT OUTER JOIN chart_policies_for_uid($2) cp ON c.id = cp.chart_id
      INNER JOIN chart_tag ct ON ct.chart_id = c.id
      INNER JOIN tag t ON ct.tag_id = t.id
    WHERE t.id = ANY ($1) AND c.chart_type = ANY ($6) AND (c.created_by = $2 OR cp.policy_action IS NOT NULL)
  )
  SELECT * FROM ranks
    WHERE rank_number > (SELECT rank_number FROM ranks WHERE ranks.id = $3)
  ORDER BY $4, ranks.id ${query.direction}
  LIMIT $5
  `, [query.tagIDs, uid, query.after, query.orderBy, query.limit, query.chartTypes]);
  return result.rows.map(dbDataToChart) as Chart[];
};

export const deleteChartsForUser = async (uid: string, queryable: Queryable) => {
  await queryable.query(`
    DELETE FROM chart WHERE created_by = $1
  `, [uid]);
};

export const insertNewChart = async (chartNew: ChartNew, uid: string, queryable: Queryable) => {
  const payload = { ...chartNew, createdBy: uid };
  const { values, columns, prep } = prepareDBInsert([omit(payload, ['id'])], dbFields);
  const result = await queryable.query(`
    INSERT INTO
      chart (${columns})
      VALUES ${prep} RETURNING ${dbFields.join(', ')}
  `, values);
  return dbDataToChart(result.rows[0]) as Chart;
};

export const updateChart = async (
  update: ChartUpdate, uid: string, queryable: Queryable) => {
  const { prep, values } = prepareDBUpdate(omit(update, ['id']), dbFields);
  const result = await queryable.query(`
    UPDATE chart
      SET ${prep}
      WHERE id = $${values.length + 1} AND created_by = $${values.length + 2}
      RETURNING ${dbFields.join(', ')}
  `, [...values, update.id, uid]);
  return dbDataToChart(result.rows[0]) as Chart;
};

export const deleteChart = async (
  chartID: number, uid: string, queryable: Queryable) => {

  await queryable.query(`
    DELETE FROM chart
      WHERE id = $1 AND created_by = $2
  `, [chartID, uid]);
};

export const executeChartQuery = async (rawQuery: ChartQuery, uid: string, queryable: Queryable) => {
  if (rawQuery.id) {
    const chart = await findChartByID(rawQuery.id, uid, queryable);
    const res = [];
    if (chart) {
      res.push(chart);
    }
    return res;
  }

  const limit = Math.min(100, rawQuery.limit || 50);
  const chartTypes = rawQuery.chartTypes;

  if (rawQuery.order === ChartQueryOrder.Random && rawQuery.tagIDs?.length) {
    return findRandomChartsByTagIDs(rawQuery.tagIDs, chartTypes, uid, limit, queryable);
  } else if (rawQuery.order === ChartQueryOrder.Random) {
    return findRandomCharts(chartTypes, uid, limit, queryable);
  }

  let order = (rawQuery.order || ChartQueryOrder.CreatedAt).toLowerCase();
  if (rawQuery.order === ChartQueryOrder.TagPosition && rawQuery.tagIDs?.length !== 1) {
    order = ChartQueryOrder.CreatedAt.toLowerCase();
  } else if (rawQuery.order === ChartQueryOrder.TagPosition && rawQuery.tagIDs?.length === 1) {
    order = ChartQueryOrder.TagPosition.toLowerCase();
  }
  let direction: 'ASC' | 'DESC' = 'DESC';
  const after = rawQuery.after;
  direction = (rawQuery.asc === undefined ? false : rawQuery.asc) ? 'ASC' : 'DESC';
  const orderBy = `${order} ${direction}`;

  const query: BaseChartQuery = { orderBy, limit, chartTypes, direction };

  if (rawQuery.tagIDs?.length && after) {
    const chartTagQueryAfter: ChartQueryByTagsAfter = {
      ...query, tagIDs: rawQuery.tagIDs, after,
    };
    return findChartsByTagsAfter(chartTagQueryAfter, uid, queryable);
  }

  if (rawQuery.tagIDs?.length) {
    const chartTagQuery: ChartQueryByTags = {
      ...query, tagIDs: rawQuery.tagIDs,
    };
    return findChartsByTags(chartTagQuery, uid, queryable);
  }

  if (after) {
    const chartQueryAfter: BaseChartQueryAfter = {
      ...query, after,
    };
    return findChartsAfter(chartQueryAfter, uid, queryable);
  }
  const charts = await findCharts(query, uid, queryable);
  return charts;
};
