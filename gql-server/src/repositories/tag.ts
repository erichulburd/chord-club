import {  kebabCase, groupBy, trim, omit } from 'lodash';
import { TagQuery, Tag, TagQueryOrder, TagNew, Chart, TagType } from '../types';
import { makeDBFields, makeSelectFields, makeDBDataToObject, prepareDBInsert, Queryable } from './db';

const attrs = [
  'id', 'munge', 'displayName', 'createdBy', 'createdAt', 'tagType',
];
const dbFields = makeDBFields(attrs);
const selectFields = makeSelectFields(dbFields, 't');
const dbDataToTag = makeDBDataToObject<Tag>([...attrs, 'tagPosition'], 'Tag');

interface BaseTagQuery {
  orderBy: string;
  direction: 'ASC' | 'DESC';
  limit: number;
  tagTypes: TagType[];
}
interface BaseTagQueryAfter extends BaseTagQuery {
  after: number;
}

const searchForTag = async (displayName: string, uid: string, query: BaseTagQuery, queryable: Queryable) => {
  const result = await queryable.query(`
    SELECT
      ${selectFields}
      FROM tag t
        LEFT OUTER JOIN tag_policies_for_uid($2) tp ON t.id = tp.tag_id
      WHERE LOWER(t.display_name) LIKE $1
        AND t.tag_type = ANY ($3)
        AND (t.created_by = $2 OR tp.policy_action IS NOT NULL)
  `, [`${displayName.toLowerCase()}%`, uid, query.tagTypes]);
  return result.rows.map(dbDataToTag) as Tag[];
};

export const findTagsByID = async (ids: number[], uid: string, queryable: Queryable) => {
  const result = await queryable.query(`
    SELECT
      ${selectFields}
      FROM tag t
        LEFT OUTER JOIN tag_policies_for_uid($2) tp ON t.id = tp.tag_id
      WHERE t.id = ANY ($1)
        AND (t.created_by = $2 OR tp.policy_action IS NOT NULL)
  `, [ids, uid]);
  return result.rows.map(dbDataToTag);
};

export const findTagByID = async (id: number, uid: string, queryable: Queryable) => {
  const result = await queryable.query(`
    SELECT
      ${selectFields}
      FROM tag t
        LEFT OUTER JOIN tag_policies_for_uid($2) tp ON t.id = tp.tag_id
      WHERE t.id = $1
        AND (t.created_by = $2 OR tp.policy_action IS NOT NULL)
  `, [id, uid]);
  if (result.rows.length < 1) {
    return undefined;
  }
  return dbDataToTag(result.rows[0]) as Tag;
};

const findTags = async (query: BaseTagQuery, uid: string, queryable: Queryable) => {
  const result = await queryable.query(`
  SELECT
    ${selectFields}
  FROM tag t
    LEFT OUTER JOIN tag_policies_for_uid($2) tp ON t.id = tp.tag_id
  WHERE t.tag_type = ANY ($1)
    AND (t.created_by = $2 OR tp.policy_action IS NOT NULL)
  ORDER BY $3, id ${query.direction}
  LIMIT $4
  `, [query.tagTypes, uid, query.orderBy, query.limit]);
  return result.rows.map(dbDataToTag) as Tag[];
};

const findTagsAfter = async (query: BaseTagQueryAfter, uid: string, queryable: Queryable) => {
  const result = await queryable.query(`
  WITH ranks AS (
    SELECT
      ${selectFields},
      RANK() OVER (
        ORDER BY $1, t.id ${query.direction}
      ) rank_number
    FROM tag t
      LEFT OUTER JOIN tag_policies_for_uid($2) tp ON t.id = tp.tag_id
    WHERE t.tag_type = ANY ($5)
      AND (t.created_by = $2 OR tp.policy_action IS NOT NULL)
  )
  SELECT
    *
  FROM ranks
  WHERE rank_number > (SELECT rank_number FROM ranks WHERE id = $3)
  ORDER BY $1, id ${query.direction}
  LIMIT $4
  `, [query.orderBy, uid, query.after, query.limit, query.tagTypes]);
  return result.rows.map(dbDataToTag) as Tag[];
};

export const getTagMunge = (displayName: string) => {
  return kebabCase(trim(displayName).toLowerCase());
};

export const findExistingTagsCreatedByUID =
  async (tags: TagNew[], uid: string, queryable: Queryable): Promise<Tag[]> => {
  if (!tags || tags.length === 0) {
    return [];
  }
  const values: any[] = [];
  const prep: string[] = [];
  tags.forEach((tag, i) => {
    prep.push(`(munge = $${i*2+1} AND created_by = $${i*2+2})`);
    values.push(getTagMunge(tag.displayName));
    values.push(uid);
  });
  const result = await queryable.query(`
    SELECT ${selectFields} FROM tag t
      WHERE ${prep.join(' OR ')}
  `, values);
  return result.rows.map(dbDataToTag);
};

export const insertNewTags = async (newTags: TagNew[], uid: string, queryable: Queryable) => {
  const { prep, values, columns } =
    prepareDBInsert(newTags.map((t) => ({ ...t, munge: getTagMunge(t.displayName), createdBy: uid })), dbFields.filter(f => f !== 'id'));
  const result = await queryable.query(`
    INSERT INTO
      tag (${columns})
      VALUES ${prep} RETURNING ${dbFields.join(', ')}
  `, values);
  const createSequences = result.rows.map((r) =>
    `CREATE SEQUENCE tag_position_${r.id} AS INTEGER START 1`
  );
  await Promise.all(createSequences.map(seqStatement => queryable.query(seqStatement)));
  return result.rows.map(dbDataToTag) as Tag[];
};

export const deleteTag = async (tagID: number, uid: string, queryable: Queryable) => {
  await queryable.query(`
    DELETE FROM tag
      WHERE created_by = $1 AND id = $2
  `, [uid, tagID]);
};

export const addTagsForChart = async (chart: Chart, tags: TagNew[], uid: string, queryable: Queryable) => {
  if (!tags || tags.length === 0) {
    return;
  }
  const existingTags = await findExistingTagsCreatedByUID(
    tags, uid, queryable);
  let savedTags = [...existingTags];

  const newTags: TagNew[] = tags
    .filter((tag) => !existingTags.some(t => t.munge === getTagMunge(tag.displayName)));
  if (newTags.length > 0) {
    const createdTags = await insertNewTags(newTags, uid, queryable);
    savedTags = savedTags.concat(createdTags);
  }

  const newChartTags = savedTags.map((t) => ({
    tagID: t.id, chartID: chart.id,
  }));
  const {
    values, prep, columns,
  } = prepareDBInsert(newChartTags, ['chart_id', 'tag_id'], {
    tagPosition: (t) => `nextval('tag_position_${t.tagID}')`
  });
  await queryable.query(`
    INSERT INTO
      chart_tag (${columns})
      VALUES ${prep}
  `, values);
};

export const unTag = async (chartID: number, tagIDs: number[], uid: string, queryable: Queryable) => {
  await queryable.query(`
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
  chartIDs: readonly number[] | number[], queryable: Queryable,
  ) => {
  const result = await queryable.query(`
    SELECT ct.chart_id, ct.tag_position, ${selectFields}
      FROM tag t
        INNER JOIN chart_tag ct
        ON t.id = ct.tag_id
      WHERE ct.chart_id = ANY ($1)
  `, [chartIDs]);
  const tagDataByChartID = groupBy(result.rows, 'chart_id');
  // this is a little hack around inability to call map on readonly? array.
  if (Array.isArray(chartIDs)) {
    return chartIDs.map((chartID) => (tagDataByChartID[chartID] || []).map(dbDataToTag)) as Tag[][];
  }
  return chartIDs.map((chartID) => (tagDataByChartID[chartID] || []).map(dbDataToTag)) as Tag[][];
};

export const updateTagPositions = async (
  tagID: number, chartIDs: number[], positions: number[], queryable: Queryable,
  ) => {
  await Promise.all(chartIDs.map((chartID, i) =>
    queryable.query(
      'UPDATE chart_tag SET tag_position=$1 WHERE tag_id=$2 AND chart_id=$3',
      [positions[i], tagID, chartID])
  ));
};

export const getCompositeTagKey =
  (t: TagNew | Tag) => getTagMunge(t.displayName)

export const tagsAreEqual = (t1: TagNew | Tag, t2: TagNew | Tag) =>
  getCompositeTagKey(t1) === getCompositeTagKey(t2);

export const reconcileChartTags = async (
  chart: Chart, tags: TagNew[],
  existingTags: Tag[], queryable: Queryable,
) => {
  const tagsToDelete = existingTags.filter(t => !tags.some(tagNew => tagsAreEqual(t, tagNew)));
  await unTag(chart.id, tagsToDelete.map(t => t.id), chart.createdBy, queryable);
  const tagsToAdd = tags.filter(t => !existingTags.some(tag => tagsAreEqual(t, tag)));
  await addTagsForChart(chart, tagsToAdd, chart.createdBy, queryable);
};

export const executeTagQuery = async (
  rawQuery: TagQuery, uid: string, queryable: Queryable): Promise<Tag[]> => {
  if (rawQuery.ids) {
    return findTagsByID(rawQuery.ids, uid, queryable);
  }
  const order = (rawQuery.order || TagQueryOrder.DisplayName).toLowerCase();
  const direction = (rawQuery.asc === undefined ? false : rawQuery.asc) ? 'ASC' : 'DESC';
  const orderBy = `${order} ${direction}`;
  const limit = Math.min(100, rawQuery.limit || 50);

  const query: BaseTagQuery = {
    orderBy, direction, limit, tagTypes: rawQuery.tagTypes,
  };
  if (rawQuery.displayName) {
    return searchForTag(rawQuery.displayName, uid, query, queryable);
  }

  if (rawQuery.after) {
    const afterQuery: BaseTagQueryAfter = { ...query, after: rawQuery.after };
    return findTagsAfter(afterQuery, uid, queryable);
  }
  return findTags(query, uid, queryable);
};

