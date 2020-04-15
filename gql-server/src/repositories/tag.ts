import { PoolClient } from 'pg';
import { snakeCase, kebabCase, range, flatten, groupBy } from 'lodash';
import { TagQuery, Tag, TagQueryOrder, TagNew } from '../types';

const selectFields = [
  'id', 'munge', 'display_name', 'createdBy', 'createdAt', 'type',
].map((field) => `t.${snakeCase(field)} AS ${field}`).join(', ');

export const executeTagQuery = async (
  query: TagQuery, userUID: string, client: PoolClient) => {
  if (query.displayName) {
    return searchForTag(query.displayName, userUID, client);
  }
  if (query.id) {
    return findTagByID(query.id, userUID, client);
  }

  const order = (query.order || TagQueryOrder.CreatedAt).toLowerCase();
  const direction = (query.asc === undefined ? false : query.asc) ? 'ASC' : 'DESC';
  const orderBy = `${order} ${direction}`;
  const limit = Math.min(100, query.limit || 50);
  if (query.after) {
    return findTagsAfter(query.after, orderBy, limit, userUID, client);
  }
  return findTags(orderBy, limit, userUID, client);
};


const searchForTag = async (displayName: string, userUID: string, client: PoolClient) => {
  const result = await client.query(`
    SELECT
      ${selectFields}
      FROM tag
      WHERE LOWER(display_name) LIKE '$1%' AND (public IS TRUE or created_by = $2)
  `, [displayName.toLowerCase(), userUID]);
  if (result.rows.length < 1) {
    return undefined;
  }
  return result.rows as Tag[];
};

const findTagByID = async (id: number, userUID: string, client: PoolClient) => {
  const result = await client.query(`
    SELECT
      ${selectFields}
      FROM tag
      WHERE id = $1 AND (public IS TRUE or created_by = $2)
  `, [id, userUID]);
  if (result.rows.length < 1) {
    return undefined;
  }
  return result.rows as Tag[];
};

const findTags = async (orderBy: string, limit: number, userUID: string, client: PoolClient) => {
  const result = await client.query(`
  SELECT
    ${selectFields}
  FROM tag
  WHERE (public IS TRUE OR created_by = $1)
  ORDER BY $2, uid ASC
  LIMIT $3
  `, [userUID, orderBy, limit]);
  return result.rows as Tag[];
};

const findTagsAfter = async (
  after: string, orderBy: string,
  limit: number, userUID: string, client: PoolClient) => {

  const result = await client.query(`
  WITH ranks AS (
    SELECT
      ${selectFields},
      RANK() OVER (
        $1, uid ASC
      ) rank_number
    FROM tag
    WHERE (public IS TRUE OR created_by = $2)
  )
  SELECT
    *
  FROM ranks
  WHERE rank_number > (SELECT rank_number FROM ranks WHERE uid = $3)
  ORDER BY $2, uid ASC
  LIMIT $4
  `, [userUID, orderBy, after, limit]);
  return result.rows as Tag[];
};

export const findExistingTags = async (tags: TagNew[], uid: string, client: PoolClient): Promise<Tag[]> => {
  const munges = tags.map((tag) => kebabCase(tag.displayName));
  const result = await client.query(`
    SELECT ${selectFields} FROM tag
      WHERE munge IN $1 AND (public IS TRUE OR created_by = $2)
  `, [munges, uid]);
  return result.rows;
};

const insertNewTags = async (newTags: TagNew[], uid: string, client: PoolClient) => {
  const valuesPrep = range(newTags.length)
    .map((i) => `$${i*3+2}, $${i*3+3}, $${i*3+4}, NOW(), $1`)
    .join('), (');
  const values = flatten(newTags.map((tag) => [
    kebabCase(tag.displayName), tag.displayName.trim(), tag.type.toLowerCase(),
  ]));
  const result = await client.query(`
    INSERT INTO
      tag (
        munge, display_name, tag_type, created_at, created_by
      )
      VALUES (${valuesPrep}) RETURNING ${selectFields}
  `, [uid, ...values]);
  return result.rows as Tag[];
};

export const addTagsForChart = async (chartID: number, tags: TagNew[], uid: string, client: PoolClient) => {
  const existingTags = await findExistingTags(tags, uid, client);
  const newTags = tags.filter((tag) => !existingTags.some(t => t.munge === kebabCase(tag.displayName)));
  let savedTags = [...existingTags];
  if (newTags.length > 0) {
    const createdTags = await insertNewTags(newTags, uid, client);
    savedTags = savedTags.concat(createdTags);
  }
  const valuesPrep = range(savedTags.length)
    .map((i) => `$1 $${i+2}`)
    .join('), (');
  const values = savedTags.map((tag) => tag.id);
  await client.query(`
    INSERT INTO
      chart_tag (chart_id, tag_id)
      VALUES (${valuesPrep})
  `, [chartID, ...values]);
};


export const unTag = async (chartID: number, tagID: number, uid: string, client: PoolClient) => {
  await client.query(`
    DELETE FROM chart_tag ct
      USING chart c
      WHERE
        ct.chart_id = c.id AND
        c.created_by = $1
        chart_id = $2 AND
        tag_id = $3
  `, [uid, chartID, tagID]);
};

export const findTagsForCharts = async (
  chartIDs: readonly number[] | number[], client: PoolClient) => {
  const result = await client.query(`
    SELECT ct.chart_id, ${selectFields}
      FROM tag t
        INNER JOIN chart_tag ct
        ON t.id = ct.tag_id
      WHERE ct.chart_id IN $1
  `, [chartIDs]);
  const tags: Tag[] = result.rows;
  const tagsByChartID = groupBy(tags, 'chart_id');
  // this is a little hack around inability to call map on readonly? array.
  if (Array.isArray(chartIDs)) {
    return chartIDs.map((chartID) => tagsByChartID[chartID] || []);
  }
  return chartIDs.map((chartID) => tagsByChartID[chartID] || []);
};
