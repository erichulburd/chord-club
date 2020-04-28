import { PoolClient } from 'pg';
import {  kebabCase, groupBy } from 'lodash';
import { TagQuery, Tag, TagQueryOrder, TagNew, Chart, BaseScopes, TagBase, TagType } from '../types';
import { makeDBFields, makeSelectFields, makeDBDataToObject, prepareDBInsert } from './db';
import {  invalidChartTagError, invalidTagQueryScopeError, invalidNewTagsScopeError } from '../util/errors';
import baseLogger from '../util/logger';

const attrs = [
  'id', 'munge', 'displayName', 'createdBy', 'createdAt', 'scope', 'tagType',
];
const dbFields = makeDBFields(attrs);
const selectFields = makeSelectFields(dbFields, 't');
const dbDataToTag = makeDBDataToObject<Tag>(attrs, 'Tag');

interface BaseTagQuery {
  orderBy: string;
  direction: 'ASC' | 'DESC';
  limit: number;
  tagTypes: TagType[];
  scopes: string[];
}
interface BaseTagQueryAfter extends BaseTagQuery {
  after: number;
}

export const executeTagQuery = async (
  rawQuery: TagQuery, uid: string, client: PoolClient): Promise<Tag[]> => {
    validatedTagQueryScopes(rawQuery.scopes, uid);
  if (rawQuery.id) {
    const tag = await findTagByID(rawQuery.id, rawQuery.scopes, client);
    if (!tag) return [];
    return [tag];
  }
  const order = (rawQuery.order || TagQueryOrder.DisplayName).toLowerCase();
  const direction = (rawQuery.asc === undefined ? false : rawQuery.asc) ? 'ASC' : 'DESC';
  const orderBy = `${order} ${direction}`;
  const limit = Math.min(100, rawQuery.limit || 50);

  const query: BaseTagQuery = {
    orderBy, direction, limit, tagTypes: rawQuery.tagTypes,
    scopes: rawQuery.scopes,
  };
  if (rawQuery.displayName) {
    return searchForTag(rawQuery.displayName, query, client);
  }

  if (rawQuery.after) {
    const afterQuery: BaseTagQueryAfter = { ...query, after: rawQuery.after };
    return findTagsAfter(afterQuery, client);
  }
  return findTags(query, client);
};

const searchForTag = async (displayName: string, query: BaseTagQuery, client: PoolClient) => {
  const result = await client.query(`
    SELECT
      ${selectFields}
      FROM tag t
      WHERE LOWER(t.display_name) LIKE $1 AND t.scope = ANY ($2) AND t.tag_type = ANY ($3)
  `, [`${displayName.toLowerCase()}%`, query.scopes, query.tagTypes]);
  return result.rows.map(dbDataToTag) as Tag[];
};

export const findTagByID = async (id: number, scopes: string[], client: PoolClient) => {
  const result = await client.query(`
    SELECT
      ${selectFields}
      FROM tag t
      WHERE t.id = $1 AND t.scope = ANY ($2)
  `, [id, scopes]);
  if (result.rows.length < 1) {
    return undefined;
  }
  return dbDataToTag(result.rows[0]) as Tag;
};

const findTags = async (query: BaseTagQuery, client: PoolClient) => {
  const result = await client.query(`
  SELECT
    ${selectFields}
  FROM tag t
  WHERE t.scope = ANY ($1) AND t.tag_type = ANY ($2)
  ORDER BY $3, id ${query.direction}
  LIMIT $4
  `, [query.scopes, query.tagTypes, query.orderBy, query.limit]);
  return result.rows.map(dbDataToTag) as Tag[];
};

const findTagsAfter = async (query: BaseTagQueryAfter, client: PoolClient) => {
  const result = await client.query(`
  WITH ranks AS (
    SELECT
      ${selectFields},
      RANK() OVER (
        ORDER BY $1, t.id ${query.direction}
      ) rank_number
    FROM tag t
    WHERE t.scope = ANY ($2) AND t.tag_type = ANY ($5)
  )
  SELECT
    *
  FROM ranks
  WHERE rank_number > (SELECT rank_number FROM ranks WHERE id = $3)
  ORDER BY $1, id ${query.direction}
  LIMIT $4
  `, [query.orderBy, query.scopes, query.after, query.limit, query.tagTypes]);
  return result.rows.map(dbDataToTag) as Tag[];
};

export const findExistingTags =
  async (tags: TagNew[], client: PoolClient): Promise<Tag[]> => {
  if (!tags || tags.length === 0) {
    return [];
  }
  const values: any[] = [];
  const prep: string[] = [];
  tags.forEach((tag, i) => {
    prep.push(`(munge = $${i*2+1} AND scope = $${i*2+2})`);
    values.push(kebabCase(tag.displayName));
    values.push(tag.scope);
  });
  const result = await client.query(`
    SELECT ${selectFields} FROM tag t
      WHERE ${prep.join(' OR ')}
  `, values);
  return result.rows.map(dbDataToTag);
};

export const insertNewTags = async (newTags: TagNew[], uid: string, client: PoolClient) => {
  const { prep, values, columns } =
    prepareDBInsert(newTags.map((t) => ({ ...t, munge: kebabCase(t.displayName), createdBy: uid })), dbFields);
  console.info(JSON.stringify({
    prep, values, columns
  }, null, 2))
  const result = await client.query(`
    INSERT INTO
      tag (${columns})
      VALUES ${prep} RETURNING ${dbFields.join(', ')}
  `, values);
  return result.rows.map(dbDataToTag) as Tag[];
};

export const deleteTag = async (tagID: number, uid: string, client: PoolClient) => {
  await client.query(`
    DELETE FROM tag
      WHERE created_by = $1 AND id = $2
  `, [uid, tagID]);
};

export const addTagsForChart = async (chart: Chart, tags: TagNew[], uid: string, client: PoolClient) => {
  if (!tags || tags.length === 0) {
    return;
  }
  const validatedTags = validateTagScopesForChart(tags, chart, uid);
  const existingTags = await findExistingTags(validatedTags, client);
  let savedTags = [...existingTags];

  const newTags: TagNew[] = validatedTags
    .filter((tag) => !existingTags.some(t => t.munge === kebabCase(tag.displayName)));
  if (newTags.length > 0) {
    const createdTags = await insertNewTags(newTags, uid, client);
    savedTags = savedTags.concat(createdTags);
  }

  const {
    values, prep, columns,
  } = prepareDBInsert(savedTags.map((t) => ({ tagID: t.id, chartID: chart.id })));
  await client.query(`
    INSERT INTO
      chart_tag (${columns})
      VALUES ${prep}
  `, values);
};

export const unTag = async (chartID: number, tagIDs: number[], uid: string, client: PoolClient) => {
  await client.query(`
    DELETE FROM chart_tag ct
      USING chart c
      WHERE
        ct.chart_id = c.id AND
        c.created_by = $1 AND
        chart_id = $2 AND
        tag_id = ANY ($3)
  `, [uid, chartID, tagIDs]);
};

export const findTagsForCharts = async (
  chartIDs: readonly number[] | number[], uid: string | undefined, client: PoolClient,
  ) => {
  const tagScopes: string[] = [BaseScopes.Public];
  if (uid !== undefined) tagScopes.push(uid);
  const result = await client.query(`
    SELECT ct.chart_id, ${selectFields}
      FROM tag t
        INNER JOIN chart_tag ct
        ON t.id = ct.tag_id
      WHERE ct.chart_id = ANY ($1) AND t.scope = ANY ($2)
  `, [chartIDs, tagScopes]);
  const tagDataByChartID = groupBy(result.rows, 'chart_id');
  // this is a little hack around inability to call map on readonly? array.
  if (Array.isArray(chartIDs)) {
    return chartIDs.map((chartID) => (tagDataByChartID[chartID] || []).map(dbDataToTag)) as Tag[][];
  }
  return chartIDs.map((chartID) => (tagDataByChartID[chartID] || []).map(dbDataToTag)) as Tag[][];
};

export const getCompositeTagKey =
  (t: TagNew | Tag) => `${t.scope}-${kebabCase(t.displayName.toLowerCase())}`;

export const tagsAreEqual = (t1: TagNew | Tag, t2: TagNew | Tag) =>
  getCompositeTagKey(t1) === getCompositeTagKey(t2);

export const reconcileChartTags = async (
  chart: Chart, tags: TagNew[],
  existingTags: Tag[], client: PoolClient,
) => {
  const tagsToDelete = existingTags.filter(t => !tags.some(tagNew => tagsAreEqual(t, tagNew)));
  await unTag(chart.id, tagsToDelete.map(t => t.id), chart.createdBy, client);
  const tagsToAdd = tags.filter(t => !existingTags.some(tag => tagsAreEqual(t, tag)));
  await addTagsForChart(chart, tagsToAdd, chart.createdBy, client);
};

export const validateNewTagsScopes = (tags: TagNew[], uid: string): TagNew[] => {
  const defaultScope = uid;
  const permittedScopes = {
    [uid]: true,
    [BaseScopes.Public]: true,
  };
  tags.forEach((t) => {
    if (t.scope && !permittedScopes[t.scope]) {
      throw invalidNewTagsScopeError(t as TagBase);
    }
  });
  return tags.map((t) => ({
    ...t,
    scope: t.scope || defaultScope,
  }), {});
};

const validatedTagQueryScopes = (scopes: string[], uid: string): void => {
  const permittedScopes = {
    [uid]: true,
    [BaseScopes.Public]: true,
  };
  scopes.forEach((s) => {
    if (!permittedScopes[s]) {
      throw invalidTagQueryScopeError(s);
    }
  });
};

const validateTagScopesForChart = (tags: TagNew[], chart: Chart, uid: string): TagNew[] => {
  const isPublic = chart.scope === BaseScopes.Public;
  const defaultScope = uid;
  const permittedScopes = {
    [uid]: true,
    [BaseScopes.Public]: isPublic,
  };
  tags.forEach((t) => {
    if (t.scope && !permittedScopes[t.scope]) {
      throw invalidChartTagError(chart.id, t as TagBase);
    }
  });
  return tags.map((t) => ({
    ...t,
    scope: t.scope || defaultScope,
  }), {});
};
