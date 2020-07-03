import { TestDBClientManager, makeDBPool, DBTxManager } from '../db';
import {
  insertNewChart, findChartByID, deleteChart, updateChart,
  deleteChartsForUser, executeChartQuery,
} from '../chart';
import { ChartNew, ChartUpdate, ChartQuery, ChartType, ChartQueryOrder, TagType, Tag, PolicyResourceType, PolicyAction } from '../../types';
import { makeChartNew, makeTagNew } from '../../../tests/factories';
import { range } from 'lodash';
import {
  insertNewTags, addTagsForChart, findTagsForCharts,
  updateTagPositions
} from '../tag';
import { PoolClient } from 'pg';
import { insertPolicies } from '../policy';

describe('chart repository', () => {
  const pool = makeDBPool();
  let dbClientManager: TestDBClientManager;
  afterAll(async () => {
    await pool.end();
  });

  describe('basic chart operations', () => {
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

    test('create and find new chart', async () => {
      const chartNew: ChartNew = makeChartNew();
      const chart = await insertNewChart(chartNew, 'uid', client);
      let retrieved = await findChartByID(chart.id, 'uid', client);
      if (retrieved === undefined) {
        fail(`could not retrieve chart ${chart.id}`);
      }
      expect(chart.id).not.toEqual(0);
      expect(chart.id).not.toEqual(undefined);
      expect(chart.id).toEqual(retrieved.id);
      expect(chart.createdBy).toEqual('uid');
      expect(retrieved.createdBy).toEqual('uid');

      const chartUpdate: ChartUpdate = { id: chart.id, abc: 'blah blah blah' };
      await updateChart(chartUpdate, 'uid', client);
      retrieved = await findChartByID(chart.id, 'uid', client);
      expect(retrieved?.abc).toEqual('blah blah blah');

      await deleteChart(chart.id, 'uid', client);
      retrieved = await findChartByID(chart.id, 'uid', client);
      expect(retrieved).toEqual(undefined);
    });

    test('delete charts for user', async () => {
      const chartIDs = await Promise.all(range(5).map(async (i) => {
        const chartNew: ChartNew = makeChartNew();
        const chart = await insertNewChart(chartNew, 'uid', client);
        return chart.id;
      }));
      const chartIDs1 = await Promise.all(range(3).map(async (i) => {
        const chartNew: ChartNew = makeChartNew();
        const chart = await insertNewChart(chartNew, 'uid2', client);
        return chart.id;
      }));

      await deleteChartsForUser('uid', client);
      let charts = await Promise.all(chartIDs.map(async (chartID) => findChartByID(chartID, 'uid', client)));
      expect(charts.every((c) => c === undefined)).toEqual(true);
      charts = await Promise.all(chartIDs1.map(async (chartID) => findChartByID(chartID, 'uid2', client)));
      expect(charts.some((c) => c === undefined)).toEqual(false);
    });
  });

  describe('executeChartQuery', () => {
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

      await Promise.all(uids.map(async (uid, i) => {
        sharedTags.push(await insertNewTags([
          makeTagNew({ tagType: TagType.Descriptor }),
          makeTagNew({ tagType: TagType.List }),
        ], uid, client));
        await insertPolicies([
          { resourceType: PolicyResourceType.Tag, action: PolicyAction.Wildcard,
            resourceID: sharedTags[i][0].id, uid: uids.find(uidInner => uidInner != uid) || '' },
          { resourceType: PolicyResourceType.Tag, action: PolicyAction.Wildcard,
            resourceID: sharedTags[i][1].id, uid: uids.find(uidInner => uidInner != uid) || '' },
        ], uid, client);

        unsharedTags.push(await insertNewTags([
          makeTagNew({ tagType: TagType.Descriptor }),
          makeTagNew({ tagType: TagType.List }),
        ], uid, client));

        const tagsToAdd = [sharedTags[i][0], sharedTags[i][1], unsharedTags[i][0], unsharedTags[i][1]];
        // private chords
        await Promise.all(range(5).map(async (i) => {
          const chartNew: ChartNew = makeChartNew({
            chartType: ChartType.Chord,
          });
          const chart = await insertNewChart(chartNew, uid, client);
          // only tag with private tags
          if (i <= tagsToAdd.length - 1 && i >= 2) {
            await addTagsForChart(chart, [tagsToAdd[i]], uid, client);
          }
          return chart.id;
        }));
        // public chords
        await Promise.all(range(5).map(async (i) => {
          const chartNew: ChartNew = makeChartNew({
            chartType: ChartType.Chord,
          });
          const chart = await insertNewChart(chartNew, uid, client);
          if (i <= tagsToAdd.length - 1) {
            await addTagsForChart(chart, [tagsToAdd[i]], uid, client);
          }
          return chart.id;
        }));
        // private progression
        await Promise.all(range(5).map(async (i) => {
          const chartNew: ChartNew = makeChartNew({
            chartType: ChartType.Progression,
          });
          const chart = await insertNewChart(chartNew, uid, client);
          // only tag with private tags
          if (i <= tagsToAdd.length - 1 && i >= 2) {
            await addTagsForChart(chart, [tagsToAdd[i]], uid, client);
          }
          return chart.id;
        }));
        // public progression
        await Promise.all(range(5).map(async (i) => {
          const chartNew: ChartNew = makeChartNew({
            chartType: ChartType.Progression,
          });
          const chart = await insertNewChart(chartNew, uid, client);
          if (i <= tagsToAdd.length - 1) {
            await addTagsForChart(chart, [tagsToAdd[i]], uid, client);
          }
          return chart.id;
        }));
      }));
    });

    afterAll(async () => {
      await txManager.rollbackTx(0);
      // await txManager.commit(0);
      client.release();
    });

    test('query just chords', async () => {
      const query: ChartQuery = {
        limit: 50,
        chartTypes: [ChartType.Chord],
        order: ChartQueryOrder.CreatedAt,
        asc: false,
      };
      const charts = await executeChartQuery(query, 'uid1', client);
      expect(charts.length).toEqual(12);
      expect(charts.every((c) => c.chartType === ChartType.Chord)).toEqual(true);
    });

    test('query order randomly', async () => {
      const query: ChartQuery = {
        limit: 10,
        chartTypes: [ChartType.Chord, ChartType.Progression],
        order: ChartQueryOrder.Random,
        asc: false,
      };
      const charts = await executeChartQuery(query, 'uid1', client);
      expect(charts.length).toEqual(10);
    });

    test('query just chords DESC', async () => {
      const query: ChartQuery = {
        limit: 50,
        chartTypes: [ChartType.Chord],
        order: ChartQueryOrder.CreatedAt,
        asc: false,
      };
      const q1Charts = await executeChartQuery(query, 'uid1', client);
      expect(q1Charts.length).toEqual(12);
      expect(q1Charts.every((c) => c.chartType === ChartType.Chord)).toEqual(true);

      query.asc = true;
      let q2Charts = await executeChartQuery(query, 'uid1', client);
      expect(q2Charts.length).toEqual(12);
      expect(q2Charts.every((c) => c.chartType === ChartType.Chord)).toEqual(true);

      q2Charts.reverse();
      expect(q2Charts.every((c, i) => q1Charts[i].id === c.id)).toEqual(true);
    });

    test('query all chords and progressions', async () => {
      const query: ChartQuery = {
        limit: 50,
        chartTypes: [ChartType.Chord, ChartType.Progression],
        order: ChartQueryOrder.CreatedAt,
        asc: false,
      };
      const charts = await executeChartQuery(query, 'uid1', client);
      expect(charts.length).toEqual(24);
    });

    test('query all chords and progressions with limit', async () => {
      const query: ChartQuery = {
        limit: 10,
        chartTypes: [ChartType.Chord, ChartType.Progression],
        order: ChartQueryOrder.CreatedAt,
        asc: false,
      };
      const charts = await executeChartQuery(query, 'uid1', client);
      expect(charts.length).toEqual(10);
    });

    test('after id', async () => {
      const query: ChartQuery = {
        limit: 50,
        chartTypes: [ChartType.Chord],
        order: ChartQueryOrder.CreatedAt,
        asc: false,
      };
      const q1Charts = await executeChartQuery(query, 'uid1', client);
      expect(q1Charts.every((c) => c.chartType === ChartType.Chord)).toEqual(true);
      const after = q1Charts[10].id;
      query.after = after;
      const q2Charts = await executeChartQuery(query, 'uid1', client);
      expect(q2Charts.every((c) => c.chartType === ChartType.Chord)).toEqual(true);
      expect(q2Charts.length).toEqual(1);
      expect(q2Charts[0].id).toEqual(q1Charts[11].id);
    });

    test('by id', async () => {
      const query: ChartQuery = {
        limit: 50,
        chartTypes: [ChartType.Chord],
        order: ChartQueryOrder.CreatedAt,
        asc: false,
      };
      const q1Charts = await executeChartQuery(query, 'uid1', client);
      expect(q1Charts.every((c) => c.chartType === ChartType.Chord)).toEqual(true);
      query.id = q1Charts[0].id;
      const q2Charts = await executeChartQuery(query, 'uid1', client);
      expect(q2Charts.every((c) => c.chartType === ChartType.Chord)).toEqual(true);
      expect(q2Charts.length).toEqual(1);
      expect(q1Charts[0].id).toEqual(q2Charts[0].id);
    });

    test('by tags', async () => {
      const query: ChartQuery = {
        limit: 50,
        chartTypes: [ChartType.Chord],
        order: ChartQueryOrder.CreatedAt,
        asc: false,
        tagIDs: [unsharedTags[0][0].id],
      };
      const q1Charts = await executeChartQuery(query, 'uid1', client);
      expect(q1Charts.every((c) => c.chartType === ChartType.Chord)).toEqual(true);
      expect(q1Charts.length).toEqual(2);
    });

    test('by tags after', async () => {
      const query: ChartQuery = {
        limit: 50,
        chartTypes: [ChartType.Chord],
        order: ChartQueryOrder.CreatedAt,
        asc: false,
        tagIDs: [unsharedTags[0][0].id],
      };
      const q1Charts = await executeChartQuery(query, 'uid1', client);
      expect(q1Charts.every((c) => c.chartType === ChartType.Chord)).toEqual(true);
      expect(q1Charts.length).toEqual(2);

      query.after = q1Charts[0].id;
      const q2Charts = await executeChartQuery(query, 'uid1', client);
      expect(q2Charts.every((c) => c.chartType === ChartType.Chord)).toEqual(true);
      expect(q2Charts.length).toEqual(1);
      expect(q1Charts[1].id).toEqual(q2Charts[0].id);
    });

    test('query order tag position', async () => {
      const tag = unsharedTags[0][0];
      const query: ChartQuery = {
        limit: 50,
        chartTypes: [ChartType.Chord],
        order: ChartQueryOrder.TagPosition,
        asc: true,
        tagIDs: [tag.id],
      };
      const q1Charts = await executeChartQuery(query, 'uid1', client);
      expect(q1Charts.every((c) => c.chartType === ChartType.Chord)).toEqual(true);
      expect(q1Charts.length).toEqual(2);
      let tagss = await findTagsForCharts(q1Charts.map(c => c.id), client);
      expect(tagss[0].find(t => t.id === tag.id)?.tagPosition).toEqual(1);
      expect(tagss[1].find(t => t.id === tag.id)?.tagPosition).toEqual(2);

      query.asc = false;
      const q2Charts = await executeChartQuery(query, 'uid1', client);
      expect(q2Charts.every((c) => c.chartType === ChartType.Chord)).toEqual(true);
      expect(q2Charts.length).toEqual(2);
      tagss = await findTagsForCharts(q2Charts.map(c => c.id), client);
      expect(tagss[0].find(t => t.id === tag.id)?.tagPosition).toEqual(2);
      expect(tagss[1].find(t => t.id === tag.id)?.tagPosition).toEqual(1);

      await updateTagPositions(tag.id, q2Charts.map(c => c.id), [1, 2], client);

      const q3Charts = await executeChartQuery(query, 'uid1', client);
      expect(q3Charts.length).toEqual(2);
      tagss = await findTagsForCharts(q3Charts.map(c => c.id), client);
      expect(tagss[0].find(t => t.id === tag.id)?.tagPosition).toEqual(1);
      expect(tagss[1].find(t => t.id === tag.id)?.tagPosition).toEqual(2);
    });
  });
});
