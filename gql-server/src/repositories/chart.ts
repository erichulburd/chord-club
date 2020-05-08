import { BaseScopes, ChartQuery, Chart, ChartQueryOrder, ChartNew, ChartUpdate, ChartType } from '../types';
import { PoolClient } from 'pg';
import { omit } from 'lodash';
import {
  prepareDBUpdate, makeDBFields, makeSelectFields,
  makeDBDataToObject,
  prepareDBInsert
} from './db';
import { invalidChartScope } from '../util/errors';

const attrs = [
  'id', 'audioURL', 'audioLength', 'imageURL', 'hint', 'name', 'description', 'abc',
  'scope', 'chartType', 'bassNote', 'root', 'quality', 'createdAt', 'createdBy',
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

const validateChartScope = (scope: string, uid: string) => {
  const validScopes = [BaseScopes.Public, uid];
  if (validScopes.indexOf(scope) < 0) {
    throw invalidChartScope(scope);
  }
};

export const findChartByID = async (id: number, uid: string, client: PoolClient) => {
  const scopes = [BaseScopes.Public, uid];
  const result = await client.query(`
    SELECT
      ${selectFields}
      FROM chart c
      WHERE c.id = $1 AND c.scope = ANY ($2)
  `, [id, scopes]);
  if (result.rows.length < 1) {
    return undefined;
  }
  return dbDataToChart(result.rows[0]) as Chart;
};

export const findChartsByID = async (chartIDs: number[], uid: string[], client: PoolClient) => {
  const scopes = [uid, BaseScopes.Public];
  const result = await client.query(`
    SELECT
      ${selectFields}
      FROM chart c
      WHERE c.id = ANY ($1) AND c.scope = ANY ($2)
  `, [chartIDs, scopes]);
  return result.rows.map(dbDataToChart);
};

const findRandomCharts = async (chartTypes: ChartType[], scopes: string[], limit: number, client: PoolClient) => {
  const result = await client.query(`
  WITH selection AS (
    SELECT
    ${selectFields}
    FROM chart c
      WHERE c.chart_type = ANY ($1) AND c.scope = ANY ($2)
  )
  SELECT ${selectFields} FROM selection c ORDER BY FLOOR(RANDOM() * $3) LIMIT $3
  `, [chartTypes, scopes, limit]);
  const charts = result.rows.map(dbDataToChart) as Chart[];
  return charts;
};

const findCharts = async (query: BaseChartQuery, scopes: string[], client: PoolClient) => {
  const result = await client.query(`
  SELECT
    ${selectFields}
  FROM chart c
    WHERE c.chart_type = ANY ($1) AND c.scope = ANY ($2)
    ORDER BY $3, c.id ${query.direction}
  LIMIT $4
  `, [query.chartTypes, scopes, query.orderBy, query.limit]);
  return result.rows.map(dbDataToChart) as Chart[];
};

const findChartsAfter = async (
  query: BaseChartQueryAfter, scopes: string[], client: PoolClient) => {

  const result = await client.query(`
  WITH ranks AS (
    SELECT
      ${selectFields},
      RANK() OVER (
        ORDER BY $1, c.id ${query.direction}
      ) rank_number
    FROM chart c
    WHERE c.scope = ANY ($2) AND c.chart_type = ANY ($5)
  )
  SELECT * FROM ranks
  WHERE rank_number > (SELECT rank_number FROM ranks WHERE id = $3)
  ORDER BY $1, id ${query.direction}
  LIMIT $4
  `, [query.orderBy, scopes, query.after, query.limit, query.chartTypes]);
  return result.rows.map(dbDataToChart) as Chart[];
};

const findChartsByTags = async (
  query: ChartQueryByTags, scopes: string[], client: PoolClient,
) => {
  const result = await client.query(`
  SELECT
    ${selectFields}
  FROM chart_tag ct
    INNER JOIN chart c ON ct.chart_id = c.id
    INNER JOIN tag t ON ct.tag_id = t.id
  WHERE t.id = ANY ($1) AND t.scope = ANY ($2) AND c.chart_type = ANY ($5)
  ORDER BY $3, c.id ${query.direction}
  LIMIT $4
  `, [query.tagIDs, scopes, query.orderBy, query.limit, query.chartTypes]);
  return result.rows.map(dbDataToChart) as Chart[];
};

const findChartsByTagsAfter = async (
  query: ChartQueryByTagsAfter, scopes: string[], client: PoolClient,
) => {
  const result = await client.query(`
  WITH ranks AS (
    SELECT
      ${selectFields},
      ct.tag_position,
      RANK() OVER (
        ORDER BY $4, c.id ${query.direction}
      ) rank_number
    FROM chart c
      INNER JOIN chart_tag ct ON ct.chart_id = c.id
      INNER JOIN tag t ON ct.tag_id = t.id
    WHERE t.id = ANY ($1) AND t.scope = ANY ($2) AND c.scope = ANY ($2) AND c.chart_type = ANY ($6)
  )
  SELECT * FROM ranks
    WHERE rank_number > (SELECT rank_number FROM ranks WHERE ranks.id = $3)
  ORDER BY $4, ranks.id ${query.direction}
  LIMIT $5
  `, [query.tagIDs, scopes, query.after, query.orderBy, query.limit, query.chartTypes]);
  return result.rows.map(dbDataToChart) as Chart[];
};

export const deleteChartsForUser = async (uid: string, client: PoolClient) => {
  await client.query(`
    DELETE FROM chart WHERE created_by = $1
  `, [uid]);
};

export const insertNewChart = async (chartNew: ChartNew, uid: string, client: PoolClient) => {
  validateChartScope(chartNew.scope, uid);
  const payload = { ...chartNew, createdBy: uid };
  const { values, columns, prep } = prepareDBInsert([omit(payload, ['id'])], dbFields);
  const result = await client.query(`
    INSERT INTO
      chart (${columns})
      VALUES ${prep} RETURNING ${dbFields.join(', ')}
  `, values);
  return dbDataToChart(result.rows[0]) as Chart;
};

export const updateChart = async (
  update: ChartUpdate, uid: string, client: PoolClient) => {
  if (update.scope) {
    validateChartScope(update.scope, uid);
  }
  const { prep, values } = prepareDBUpdate(omit(update, ['id']), dbFields);
  const result = await client.query(`
    UPDATE chart
      SET ${prep}
      WHERE id = $${values.length + 1} AND created_by = $${values.length + 2}
      RETURNING ${dbFields.join(', ')}
  `, [...values, update.id, uid]);
  return dbDataToChart(result.rows[0]) as Chart;
};

export const deleteChart = async (
  chartID: number, uid: string, client: PoolClient) => {

  await client.query(`
    DELETE FROM chart
      WHERE id = $1 AND created_by = $2
  `, [chartID, uid]);
};

export const executeChartQuery = async (rawQuery: ChartQuery, uid: string, client: PoolClient) => {
  if (rawQuery.id) {
    const chart = await findChartByID(rawQuery.id, uid, client);
    const res = [];
    if (chart) {
      res.push(chart);
    }
    return res;
  }

  const limit = Math.min(100, rawQuery.limit || 50);
  const chartTypes = rawQuery.chartTypes;
  const scopes = rawQuery.scopes || [uid, BaseScopes.Public];

  if (rawQuery.order === ChartQueryOrder.Random) {
    return findRandomCharts(chartTypes, scopes, limit, client);
  }

  let order = (rawQuery.order || ChartQueryOrder.CreatedAt).toLowerCase();
  if (rawQuery.order === ChartQueryOrder.TagPosition && rawQuery.tagIDs?.length !== 1) {
    order = ChartQueryOrder.CreatedAt.toLowerCase();
  } else if (rawQuery.order === ChartQueryOrder.TagPosition && rawQuery.tagIDs?.length === 1) {
    order = ChartQueryOrder.TagPosition.toLowerCase();
  }
  let direction: 'ASC' | 'DESC' = 'DESC';
  let after = rawQuery.after;
  direction = (rawQuery.asc === undefined ? false : rawQuery.asc) ? 'ASC' : 'DESC';
  const orderBy = `${order} ${direction}`;

  const query: BaseChartQuery = { orderBy, limit, chartTypes, direction };

  if (rawQuery.tagIDs?.length && after) {
    const chartTagQueryAfter: ChartQueryByTagsAfter = {
      ...query, tagIDs: rawQuery.tagIDs, after,
    };
    return findChartsByTagsAfter(chartTagQueryAfter, scopes, client);
  }

  if (rawQuery.tagIDs?.length) {
    const chartTagQuery: ChartQueryByTags = {
      ...query, tagIDs: rawQuery.tagIDs,
    };
    return findChartsByTags(chartTagQuery, scopes, client);
  }

  if (after) {
    const chartQueryAfter: BaseChartQueryAfter = {
      ...query, after,
    };
    return findChartsAfter(chartQueryAfter, scopes, client);
  }
  const charts = await findCharts(query, scopes, client);
  return charts;
};
