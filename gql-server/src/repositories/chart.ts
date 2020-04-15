import { ChartQuery, Chart, ChartQueryOrder, ChartNew, ChartUpdate } from '../types';
import { PoolClient } from 'pg';
import { snakeCase, omit } from 'lodash';
import { prepareDBUpdate } from './db';

const attrs = [
  'id', 'audioURL', 'imageURL', 'hint', 'notes', 'abc',
  'public', 'chartType', 'bassNote', 'quality', 'createdAt', 'createdBy',
  'updatedAt',
];
const dbFields = attrs.map((attr) => snakeCase(attr));
const selectFields = dbFields.join(', ');
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

export const executeChartQuery = async (query: ChartQuery, userUID: string, client: PoolClient) => {
  if (query.id) {
    const chart = await findChartByID(query.id, userUID, client);
    const res = [];
    if (chart) {
      res.push(chart);
    }
    return res;
  }

  const order = (query.order || ChartQueryOrder.CreatedAt).toLowerCase();
  const direction = (query.asc === undefined ? false : query.asc) ? 'ASC' : 'DESC';
  const orderBy = `${order} ${direction}`;
  const limit = Math.min(100, query.limit || 50);
  if (query.after) {
    return findChartsAfter(query.after, orderBy, limit, userUID, client);
  }
  return findCharts(orderBy, limit, userUID, client);
};

export const findChartByID = async (id: number, userUID: string, client: PoolClient) => {
  const result = await client.query(`
    SELECT
      ${selectFields}
      FROM chart
      WHERE id = $1 AND (created_by = $2 OR public IS TRUE)
  `, [id, userUID]);
  if (result.rows.length < 1) {
    return undefined;
  }
  return dbDataToChart(result.rows[0]) as Chart;
};

const findCharts = async (orderBy: string, limit: number, userUID: string, client: PoolClient) => {
  const result = await client.query(`
  SELECT
    ${selectFields}
  FROM chart
  WHERE created_by = $1 OR public IS TRUE
  ORDER BY $2, uid ASC
  LIMIT $3
  `, [userUID, orderBy, limit]);
  return result.rows.map(dbDataToChart) as Chart[];
};

const findChartsAfter = async (
  after: string, orderBy: string,
  limit: number, userUID: string, client: PoolClient) => {

  const result = await client.query(`
  WITH ranks AS (
    SELECT
      ${selectFields},
      RANK() OVER (
        $1, uid ASC
      ) rank_number
    FROM chart
    WHERE (created_by = $2 OR public IS TRUE)
  )
  SELECT
    uid, username, created_at
  FROM ranks
  WHERE rank_number > (SELECT rank_number FROM ranks WHERE uid = $3)
  ORDER BY $1, uid ASC
  LIMIT $4
  `, [orderBy, userUID, after, limit]);
  return result.rows.map(dbDataToChart) as Chart[];
};

export const deleteChartsForUser = async (uid: string, client: PoolClient) => {
  await client.query(`
    DELETE FROM chart WHERE created_by = $1
  `, [uid]);
};

export const createNewChart = async (chartNew: ChartNew, uid: string, client: PoolClient) => {
  const {
    audioURL, imageURL, hint, notes, abc, public: pblic,
    chartType, bassNote, root, quality,
  } = chartNew;
  const result = await client.query(`
    INSERT INTO
      chart (
        audio_url, image_url, hint, notes, abc, public,
        chart_type, bass_note, root, quality,
        created_at, created_by
      )
      VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9, $10, NOW(), $11
      ) RETURNING ${selectFields}
  `, [
    audioURL, imageURL, hint, notes, abc, pblic,
    chartType.toLowerCase(), bassNote, root, quality.toLowerCase(), uid,
  ]);
  return dbDataToChart(result.rows[0]) as Chart;
};

export const updateChart = async (
  update: ChartUpdate, uid: string, client: PoolClient) => {

  const { prep, values } = prepareDBUpdate(omit(update, 'id'));

  const result = await client.query(`
    UPDATE chart
      SET ${prep}
      WHERE id = $${values.length + 1} AND created_by = $${values.length + 2}
  `, [...values, update.id, uid]);
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
