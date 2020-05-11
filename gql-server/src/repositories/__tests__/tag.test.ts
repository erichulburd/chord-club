import { makeDBPool, TestDBClientManager, DBTxManager } from '../db';
import { PoolClient } from 'pg';
import { TagNew, ChartNew, ChartType, BaseScopes, TagQuery, Tag, TagType } from '../../types';
import { makeTagNew, makeChartNew } from '../../../tests/factories';
import { insertNewTags, deleteTag, addTagsForChart, findTagsForCharts, unTag, executeTagQuery } from '../tag';
import { insertNewChart } from '../chart';
import { ApolloError } from 'apollo-server-express';

describe('tag repository', () => {
  const pool = makeDBPool();
  let dbClientManager: TestDBClientManager;
  afterAll(async () => {
    await pool.end();
  });

  describe('basic tag operations', () => {
    let client: PoolClient;
    let txManager: DBTxManager;

    beforeEach(async () => {
      dbClientManager = await TestDBClientManager.new(pool);
      const conn = await dbClientManager.newConnection();
      client = conn[0];
      txManager = conn[1];
    });

    afterEach(async () => {
      await txManager.rollbackTx(0);
      client.release();
    });

    describe('insertNewTags', () => {
      test('inserts new tags for the user', async () => {
        const tagsNew: TagNew[] = [
          makeTagNew(),
          makeTagNew(),
          makeTagNew(),
        ];
        const tags = await insertNewTags(tagsNew, 'uid', client);
        expect(tags.length).toEqual(3);
        expect(tags.every((t) => t.id !== undefined)).toEqual(true);
        const res = await client.query('SELECT * FROM tag WHERE created_by = $1', ['uid']);
        expect(res.rows.length).toEqual(3);
      });
    });
    describe('deleteTag', () => {
      test('deletes tag only for user', async () => {
        const tagsNew: TagNew[] = [
          makeTagNew({ scope: 'uid' }),
          makeTagNew({ scope: 'uid' }),
        ];
        const tags1 = await insertNewTags(tagsNew, 'uid', client);
        const tags2 =
          await insertNewTags(tagsNew.map((t) => ({ ...t, scope: 'uid2'})), 'uid2', client);
        await deleteTag(tags1[0].id, 'uid', client);
        let res = await client.query('SELECT * FROM tag');
        expect(res.rows.length).toEqual(3);
        await deleteTag(tags2[0].id, 'uid', client);
        expect(res.rows.length).toEqual(3);
      });
    });
    describe('addTagsForChart', () => {
      test('adds new tag to the relevant chart', async () => {
        const chartNew: ChartNew = makeChartNew({
          chartType: ChartType.Chord,
          scope: BaseScopes.Public,
        });
        const chart = await insertNewChart(chartNew, 'uid', client);
        await addTagsForChart(chart, [makeTagNew(), makeTagNew()], 'uid', client);
        const tags = await findTagsForCharts([chart.id], 'uid', client);
        expect(tags[0].length).toEqual(2);
        expect(tags[0].every(t => t.id !== undefined)).toEqual(true);
      });
      test('throws error if trying to add public tag to private chart', async () => {
        const chartNew: ChartNew = makeChartNew({
          chartType: ChartType.Chord,
          scope: 'uid',
        });
        const chart = await insertNewChart(chartNew, 'uid', client);
        expect(
          addTagsForChart(chart, [makeTagNew({ scope: BaseScopes.Public })], 'uid', client)
        ).rejects.toThrowError(ApolloError);
      });
    });
    describe('unTag', () => {
      test('adds new tag to the relevant chart', async () => {
        const chartNew: ChartNew = makeChartNew({
          chartType: ChartType.Chord,
          scope: BaseScopes.Public,
        });
        const chart = await insertNewChart(chartNew, 'uid', client);
        await addTagsForChart(chart, [makeTagNew(), makeTagNew()], 'uid', client);
        let tags = await findTagsForCharts([chart.id], 'uid', client);
        expect(tags[0].length).toEqual(2);
        const removedTagID = tags[0][0].id;
        await unTag(chart.id, [removedTagID], 'uid', client);
        tags = await findTagsForCharts([chart.id], 'uid', client);
        expect(tags[0].length).toEqual(1);
        expect(tags[0].every(t => t.id !== removedTagID)).toEqual(true);
      });
    });
    describe('findTagsForCharts', () => {
      test('finds tags for specified charts', async () => {
        const chartNew: ChartNew = makeChartNew({
          chartType: ChartType.Chord,
          scope: BaseScopes.Public,
        });
        const chart1 = await insertNewChart(chartNew, 'uid', client);
        const chart2 = await insertNewChart(chartNew, 'uid', client);
        const chart3 = await insertNewChart(chartNew, 'uid1', client);

        await addTagsForChart(chart1, [makeTagNew({ scope: 'uid' }), makeTagNew()], 'uid', client);
        await addTagsForChart(chart2, [makeTagNew({ scope: 'uid' }), makeTagNew()], 'uid', client);
        await addTagsForChart(chart3, [makeTagNew({ scope: 'uid1' }), makeTagNew()], 'uid1', client);

        let tags = await findTagsForCharts([chart1.id, chart2.id, chart3.id], 'uid', client);
        expect(tags.length).toEqual(3);
        expect(tags[0].length).toEqual(2);
        expect(tags[1].length).toEqual(2);
        expect(tags[2].length).toEqual(1);
        expect(tags[2].every(t => t.scope === BaseScopes.Public)).toEqual(true);
      });
    });
  });

  describe('executeQuery', () => {
    let client: PoolClient;
    let txManager: DBTxManager;
    let publicTags: Tag[];
    let privateTags: Tag[][] = [];

    beforeAll(async () => {
      dbClientManager = await TestDBClientManager.new(pool);
      const conn = await dbClientManager.newConnection();
      client = conn[0];
      txManager = conn[1];

      const uids = ['uid1', 'uid2'];

      publicTags = await insertNewTags([
        makeTagNew({ scope: BaseScopes.Public, tagType: TagType.Descriptor }),
        makeTagNew({ displayName: 'yADa', scope: BaseScopes.Public, tagType: TagType.List }),
      ], 'uid', client);

      await Promise.all(uids.map(async (uid) => {
        privateTags.push(await insertNewTags([
          makeTagNew({ displayName: 'yADa', scope: uid, tagType: TagType.Descriptor }),
          makeTagNew({ scope: uid, tagType: TagType.List }),
        ], uid, client));
      }));
    });

    afterAll(async () => {
      await txManager.rollbackTx(0);
      client.release();
    });

    test('search', async () => {
      const query: TagQuery = {
        displayName: 'yad',
        tagTypes: [TagType.Descriptor, TagType.List],
        scopes: [BaseScopes.Public, 'uid1']
      };
      const tags = await executeTagQuery(query, 'uid1', client);
      expect(tags.length).toEqual(2);
      expect(tags.every((tag) => tag.displayName === 'yADa')).toEqual(true);
    });
    test('findByID', async () => {
      const query = {
        ids: [publicTags[0].id],
        tagTypes: [TagType.Descriptor, TagType.List],
        scopes: [BaseScopes.Public, 'uid1']
      };
      const tags = await executeTagQuery(query, 'uid1', client);
      expect(tags.length).toEqual(1);
      expect(tags[0].id).toEqual(query.ids[0]);

    });
    test('findTags and paginate after', async () => {
      const query: TagQuery = {
        tagTypes: [TagType.Descriptor, TagType.List],
        scopes: [BaseScopes.Public, 'uid1']
      };
      const tags = await executeTagQuery(query, 'uid1', client);
      expect(tags.length).toEqual(4);

      query.after = tags[1].id;
      const tags2 = await executeTagQuery(query, 'uid1', client);
      expect(tags2.length).toEqual(2);
      expect(tags2[0].id).toEqual(tags[2].id);
      expect(tags2[1].id).toEqual(tags[3].id);
    });
  });
});
