import { PoolClient } from 'pg';
import { prepareDBInsert } from './db';
import { Extension } from '../types';
import { snakeCase, groupBy } from 'lodash';

const selectFields = [
  'id', 'extensionType', 'degree',
].map((field) => `e.${snakeCase(field)} AS ${field}`).join(', ');

export const insertExtensions = async (
  extensions: Extension[], client: PoolClient) => {
  const exts = extensions.map((ext) => ({
    degree: ext.degree,
    extentsionType: ext.extensionType?.toLowerCase(),
  }));
  const { columns, prep, values } = prepareDBInsert(exts);
  await client.query(`
    INSERT INTO extension (${columns})
      VALUES ${prep}
  `, values);
};

export const addExtensionsForChart = async (
  chartID: number, extensionIDs: number[], client: PoolClient) => {
    const inserts = extensionIDs.map((extensionID) => ({ chartID, extensionID }));
  const { columns, prep, values } = prepareDBInsert(inserts);
  await client.query(`
    INSERT INTO chart_extension (${columns})
      VALUES ${prep}
  `, values);
};

export const removeExtensionsForChart = async (
  chartID: number, extensionIDs: number[], client: PoolClient) => {
  await client.query(`
    DELETE FROM chart_extension
      WHERE chart_id = $1 AND extension_id IN $2
  `, [chartID, extensionIDs]);
};

export const findExtensionsForCharts = async (
  chartIDs: readonly number[] | number[], client: PoolClient) => {
  const result = await client.query(`
    SELECT ce.chart_id, ${selectFields}
      FROM extension e
        INNER JOIN chart_extension ce
        ON e.id = ce.extension_id
      WHERE ce.chart_id IN $1
  `, [chartIDs]);
  const extensions: Extension[] = result.rows;
  const extensionsByChartID = groupBy(extensions, 'chart_id');
  // this is a little hack around inability to call map on readonly? array.
  if (Array.isArray(chartIDs)) {
    return chartIDs.map((chartID) => extensionsByChartID[chartID] || []);
  }
  return chartIDs.map((chartID) => extensionsByChartID[chartID] || []);
};

export const findAllExtensions = async (client: PoolClient) => {
  const result = await client.query(`
    SELECT ${selectFields} FROM extension
  `);
  return result.rows as Extension[];
};
