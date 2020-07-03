import { makeDBPool, TestDBClientManager, DBTxManager } from '../db';
import { PoolClient } from 'pg';
import { TagNew, ChartNew, ChartType, TagQuery, Tag, TagType, Chart } from '../../types';
import { makeTagNew, makeChartNew } from '../../../tests/factories';
import { insertNewTags, deleteTag, addTagsForChart, findTagsForCharts, unTag, executeTagQuery } from '../tag';
import { insertNewChart } from '../chart';

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
      // await txManager.commit(0);
      client.release();
    });

    describe('insertNewTags', () => {
      test('inserts new tags for the user', async () => {
        const tagsNew: TagNew[] = [
          makeTagNew(),
          makeTagNew(),
          makeTagNew(),
        ];
        const tags = await insertNewTags(tagsNew, 'xxxx', client);
        expect(tags.length).toEqual(3);
        expect(tags.every((t) => t.id !== undefined)).toEqual(true);
        const res = await client.query('SELECT * FROM tag WHERE created_by = $1', ['xxxx']);
        expect(res.rows.length).toEqual(3);
      });
    });
    describe('deleteTag', () => {
      test('deletes tag only for user', async () => {
        const tagsNew: TagNew[] = [
          makeTagNew(),
          makeTagNew(),
        ];
        const tags1 = await insertNewTags(tagsNew, 'uid', client);
        const tags2 =
          await insertNewTags(tagsNew, 'uid2', client);
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
        });
        const chart = await insertNewChart(chartNew, 'uid', client);
        await addTagsForChart(chart, [makeTagNew(), makeTagNew()], 'uid', client);
        const tags = await findTagsForCharts([chart.id], client);
        expect(tags[0].length).toEqual(2);
        expect(tags[0].every(t => t.id !== undefined)).toEqual(true);
      });
    });
    describe('unTag', () => {
      test('adds new tag to the relevant chart', async () => {
        const chartNew: ChartNew = makeChartNew({
          chartType: ChartType.Chord,
        });
        const chart = await insertNewChart(chartNew, 'uid', client);
        await addTagsForChart(chart, [makeTagNew(), makeTagNew()], 'uid', client);
        let tags = await findTagsForCharts([chart.id], client);
        expect(tags[0].length).toEqual(2);
        const removedTagID = tags[0][0].id;
        await unTag(chart.id, [removedTagID], 'uid', client);
        tags = await findTagsForCharts([chart.id], client);
        expect(tags[0].length).toEqual(1);
        expect(tags[0].every(t => t.id !== removedTagID)).toEqual(true);
      });
    });
    describe('findTagsForCharts', () => {
      test('finds tags for specified charts', async () => {
        const chartNew: ChartNew = makeChartNew({
          chartType: ChartType.Chord,
        });
        const chart1 = await insertNewChart(chartNew, 'uid', client);
        const chart2 = await insertNewChart(chartNew, 'uid', client);
        const chart3 = await insertNewChart(chartNew, 'uid1', client);

        await addTagsForChart(chart1, [makeTagNew(), makeTagNew()], 'uid', client);
        await addTagsForChart(chart2, [makeTagNew(), makeTagNew()], 'uid', client);
        await addTagsForChart(chart3, [makeTagNew(), makeTagNew()], 'uid1', client);

        let tags = await findTagsForCharts([chart1.id, chart2.id, chart3.id], client);
        expect(tags.length).toEqual(3);
        expect(tags[0].length).toEqual(2);
        expect(tags[1].length).toEqual(2);
        expect(tags[2].length).toEqual(2);
      });
    });
  });

  describe('executeQuery', () => {
    let client: PoolClient;
    let txManager: DBTxManager;
    let sharedTags: Tag[][] = [];
    let unsharedTags: Tag[][] = [];

    beforeAll(async () => {
      dbClientManager = await TestDBClientManager.new(pool);
      const conn = await dbClientManager.newConnection();
      client = conn[0];
      txManager = conn[1];

      const uids = ['uid1', 'uid2'];

      await Promise.all(uids.map(async (uid) => {
        sharedTags.push(await insertNewTags([
          makeTagNew({ tagType: TagType.Descriptor }),
          makeTagNew({ displayName: 'yADa1', tagType: TagType.List }),
        ], uid, client));

        unsharedTags.push(await insertNewTags([
          makeTagNew({ displayName: 'yADa2', tagType: TagType.Descriptor }),
          makeTagNew({ tagType: TagType.List }),
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
      };
      const tags = await executeTagQuery(query, 'uid1', client);
      expect(tags.length).toEqual(2);
      expect(tags.every((tag) => tag.displayName.slice(0, 4) === 'yADa')).toEqual(true);
    });

    test('findByID', async () => {
      const query = {
        ids: [sharedTags[0][0].id],
        tagTypes: [TagType.Descriptor, TagType.List],
      };
      const tags = await executeTagQuery(query, 'uid1', client);
      expect(tags.length).toEqual(1);
      expect(tags[0].id).toEqual(query.ids[0]);

    });
    test('findTags and paginate after', async () => {
      const query: TagQuery = {
        tagTypes: [TagType.Descriptor, TagType.List],
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
