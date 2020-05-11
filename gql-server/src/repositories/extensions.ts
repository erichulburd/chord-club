import { prepareDBInsert, Queryable } from './db';
import { Extension, ExtensionNew, Chart } from '../types';
import { groupBy } from 'lodash';
import { makeDBFields, makeSelectFields, makeDBDataToObject } from './db';

const attrs = [
  'id', 'extensionType', 'degree',
];
const dbFields = makeDBFields(attrs);
const selectFields = makeSelectFields(dbFields, 'e');
const dbDataToExtension = makeDBDataToObject<Extension>(attrs, 'Extension');

export const insertExtensions = async (
  extensions: ExtensionNew[], queryable: Queryable) => {
  const { columns, prep, values } = prepareDBInsert(extensions);
  const res = await queryable.query(`
    INSERT INTO extension (${columns})
      VALUES ${prep} RETURNING ${dbFields.join(', ')}
  `, values);
  return res.rows.map(dbDataToExtension);
};

export const addExtensionsForChart = async (
  chartID: number, extensionIDs: number[], queryable: Queryable) => {
  if (!extensionIDs || extensionIDs.length === 0) {
    return;
  }
  const inserts = extensionIDs.map((extensionID) => ({ chartID, extensionID }));
  const { columns, prep, values } = prepareDBInsert(inserts);
  await queryable.query(`
    INSERT INTO chart_extension (${columns})
      VALUES ${prep}
  `, values);
};

export const removeExtensionsForChart = async (
  chartID: number, extensionIDs: number[], queryable: Queryable) => {
  await queryable.query(`
    DELETE FROM chart_extension
      WHERE chart_id = $1 AND extension_id = ANY ($2)
  `, [chartID, extensionIDs]);
};

export const findExtensionsForCharts = async (
  chartIDs: readonly number[] | number[], queryable: Queryable) => {
  const result = await queryable.query(`
    SELECT ce.chart_id, ${selectFields}
      FROM extension e
        INNER JOIN chart_extension ce
        ON e.id = ce.extension_id
      WHERE ce.chart_id = ANY ($1)
  `, [chartIDs]);
  const extensions = result.rows;
  const extensionsByChartID = groupBy(extensions, 'chart_id');
  // this is a little hack around inability to call map on readonly? array.
  if (Array.isArray(chartIDs)) {
    return chartIDs
      .map((chartID) => (extensionsByChartID[chartID] || []).map(dbDataToExtension));
  }
  return chartIDs
    .map((chartID) => (extensionsByChartID[chartID] || []).map(dbDataToExtension));
};

export const findAllExtensions = async (queryable: Queryable) => {
  const result = await queryable.query(`
    SELECT ${selectFields} FROM extension e
  `);
  return result.rows.map(dbDataToExtension) as Extension[];
};

export const reconcileChartExtensions = async (
  chart: Chart, extensionIDs: number[],
  existingExtensionIDs: number[], queryable: Queryable,
) => {
  const extensionsToDelete = existingExtensionIDs
    .filter(extensionID => !extensionIDs.includes(extensionID));
  await removeExtensionsForChart(chart.id, extensionsToDelete, queryable);
  const extensionsToAdd = extensionIDs
    .filter(extensionID => !existingExtensionIDs.includes(extensionID));
  await addExtensionsForChart(chart.id, extensionsToAdd, queryable);
};
