import { BaseScopes, ChartQuery, Chart, ChartQueryOrder, ChartNew, ChartUpdate, ChartType, ChartBase } from '../types';
import { PoolClient } from 'pg';
import { snakeCase, omit } from 'lodash';
import { prepareDBUpdate } from './db';
import { invalidChartScope } from '../util/errors';

const attrs = [
  'id', 'audioURL', 'imageURL', 'hint', 'notes', 'abc',
  'scope', 'chartType', 'bassNote', 'root', 'quality', 'createdAt', 'createdBy',
  'updatedAt',
];
const dbFields = attrs.map((attr) => snakeCase(attr));
const selectFields = dbFields.map((field) => `c.${field}`).join(', ');
const dbFieldsToAttr: {[key: string]: string} = attrs.reduce((prev, attr) => ({
  ...prev,
  [snakeCase(attr)]: attr,
}), {});
const dbDataToChart = (row: {[key: string]: any} | undefined) => {
  if (row === undefined) {
    return;
  }
  return Object.keys(row).reduce((prev, dbField) => ({
    ...prev,
    [dbFieldsToAttr[dbField]]: row[dbField],
  }), {});
};

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

export const executeChartQuery = async (rawQuery: ChartQuery, uid: string, client: PoolClient) => {
  if (rawQuery.id) {
    const chart = await findChartByID(rawQuery.id, uid, client);
    const res = [];
    if (chart) {
      res.push(chart);
    }
    return res;
  }

  const order = (rawQuery.order || ChartQueryOrder.CreatedAt).toLowerCase();
  const direction = (rawQuery.asc === undefined ? false : rawQuery.asc) ? 'ASC' : 'DESC';
  const orderBy = `${order} ${direction}`;
  const limit = Math.min(100, rawQuery.limit || 50);
  const chartTypes = rawQuery.chartTypes;
  let query: BaseChartQuery = { orderBy, limit, chartTypes, direction };

  if (rawQuery.tagIDs && rawQuery.after) {
    const chartTagQueryAfter: ChartQueryByTagsAfter = {
      ...query, tagIDs: rawQuery.tagIDs, after: rawQuery.after,
    };
    return findChartsByTagsAfter(chartTagQueryAfter, uid, client);
  }

  if (rawQuery.tagIDs) {
    const chartTagQuery: ChartQueryByTags = {
      ...query, tagIDs: rawQuery.tagIDs,
    };
    return findChartsByTags(chartTagQuery, uid, client);
  }

  if (rawQuery.after) {
    const chartQueryAfter: BaseChartQueryAfter = {
      ...query, after: rawQuery.after,
    };
    return findChartsAfter(chartQueryAfter, uid, client);
  }
  return findCharts(query, uid, client);
};

export const findChartByID = async (id: number, uid: string, client: PoolClient) => {
  const scopes = [uid, BaseScopes.Public];
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

const findCharts = async (query: BaseChartQuery, uid: string, client: PoolClient) => {
  const scopes = [uid, BaseScopes.Public];
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
  query: BaseChartQueryAfter, uid: string, client: PoolClient) => {

  const scopes = [uid, BaseScopes.Public];
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
  query: ChartQueryByTags, uid: string, client: PoolClient,
) => {
  const tagScopes = [BaseScopes.Public, uid];
  const result = await client.query(`
  SELECT
    ${selectFields}
  FROM chart_tag ct
    INNER JOIN chart c ON ct.chart_id = c.id
    INNER JOIN tag t ON ct.tag_id = t.id
  WHERE t.id = ANY ($1) AND t.scope = ANY ($2) AND c.chart_type = ANY ($5)
  ORDER BY $3, c.id ${query.direction}
  LIMIT $4
  `, [query.tagIDs, tagScopes, query.orderBy, query.limit, query.chartTypes]);
  return result.rows.map(dbDataToChart) as Chart[];
};

const findChartsByTagsAfter = async (
  query: ChartQueryByTagsAfter, uid: string, client: PoolClient,
) => {
  const scopes = [BaseScopes.Public, uid];
  const result = await client.query(`
  WITH ranks AS (
    SELECT
      ${selectFields},
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
  const {
    audioURL, imageURL, hint, notes, abc, scope,
    chartType, bassNote, root, quality,
  } = chartNew;
  validateChartScope(scope, uid);
  const result = await client.query(`
    INSERT INTO
      chart (
        audio_url, image_url, hint, notes, abc, scope,
        chart_type, bass_note, root, quality,
        created_at, created_by
      )
      VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9, $10, NOW(), $11
      ) RETURNING ${dbFields.join(', ')}
  `, [
    audioURL, imageURL, hint, notes, abc, scope,
    chartType, bassNote, root, quality, uid,
  ]);
  return dbDataToChart(result.rows[0]) as Chart;
};

export const updateChart = async (
  update: ChartUpdate, uid: string, client: PoolClient) => {
  if (update.scope) {
    validateChartScope(update.scope, uid);
  }
  const { prep, values } = prepareDBUpdate(omit(update, 'id'));
  const result = await client.query(`
    UPDATE chart
      SET ${prep}
      WHERE id = $${values.length + 1} AND created_by = $${values.length + 2}
      RETURNING ${dbFields.join(', ')}
  `, [...values, update.id, uid]);
  if (result.rows.length === 0) {
    return undefined;
  }
  return dbDataToChart(result.rows[0]) as Chart;
};

export const deleteChart = async (
  chartID: number, uid: string, client: PoolClient) => {

  const result = await client.query(`
    DELETE FROM chart
      WHERE id = $1 AND created_by = $2
  `, [chartID, uid]);
  return dbDataToChart(result.rows[0]) as Chart;
};

const validateChartScope = (scope: string, uid: string) => {
  const validScopes = [BaseScopes.Public, uid];
  if (validScopes.indexOf(scope) < 0) {
    throw invalidChartScope(scope);
  }
};