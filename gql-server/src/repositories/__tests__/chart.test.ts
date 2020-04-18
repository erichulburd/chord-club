import { TestDBClientManager, makeDBPool, DBTxManager } from '../db';
import { PoolClient } from 'pg';
import { insertNewChart, findChartByID, deleteChart, updateChart, deleteChartsForUser, executeChartQuery } from '../chart';
import { ChartNew, ChartUpdate, ChartQuery, ChartType, ChartQueryOrder, BaseScopes, TagType, Tag } from '../../types';
import { makeChartNew, makeTagNew } from '../../../tests/factories';
import { range } from 'lodash';
import { insertNewTags, addTagsForChart } from '../tag';
import { ApolloError } from 'apollo-server-express';

describe('chart repository', () => {
  const pool = makeDBPool();
  const dbClientManager = new TestDBClientManager(pool);
  afterAll(async () => {
    await pool.end();
  });

  describe('basic chart operations', () => {
    let client: PoolClient;
    let txManager: DBTxManager;

    beforeEach(async () => {
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

    test('create fails if scope is invalid', async () => {
      const chartNew: ChartNew = makeChartNew({ scope: 'uid2' });
      expect(insertNewChart(chartNew, 'uid', client)).rejects.toThrow(ApolloError);
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
    let publicTags: Tag[];
    let privateTags: Tag[][] = [];

    beforeAll(async () => {
      const conn = await dbClientManager.newConnection();
      client = conn[0];
      txManager = conn[1];

      const uids = ['uid1', 'uid2'];

      publicTags = await insertNewTags([
        makeTagNew({ scope: BaseScopes.Public, tagType: TagType.Descriptor }),
        makeTagNew({ scope: BaseScopes.Public, tagType: TagType.List }),
      ], 'uid', client);

      await Promise.all(uids.map(async (uid, i) => {
        privateTags.push(await insertNewTags([
          makeTagNew({ scope: uid, tagType: TagType.Descriptor }),
          makeTagNew({ scope: uid, tagType: TagType.List }),
        ], uid, client));

        const tagsToAdd = [publicTags[0], publicTags[1], privateTags[i][0], privateTags[i][1]];
        // private chords
        await Promise.all(range(5).map(async (i) => {
          const chartNew: ChartNew = makeChartNew({
            chartType: ChartType.Chord,
            scope: uid,
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
            scope: BaseScopes.Public,
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
            scope: uid,
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
            scope: BaseScopes.Public,
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
      expect(charts.length).toEqual(15);
      expect(charts.every((c) => c.chartType === ChartType.Chord)).toEqual(true);
    });

    test('query just chords DESC', async () => {
      const query: ChartQuery = {
        limit: 50,
        chartTypes: [ChartType.Chord],
        order: ChartQueryOrder.CreatedAt,
        asc: false,
      };
      const q1Charts = await executeChartQuery(query, 'uid1', client);
      expect(q1Charts.length).toEqual(15);
      expect(q1Charts.every((c) => c.chartType === ChartType.Chord)).toEqual(true);

      query.asc = true;
      let q2Charts = await executeChartQuery(query, 'uid1', client);
      expect(q2Charts.length).toEqual(15);
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
      expect(charts.length).toEqual(30);
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
      expect(q2Charts.length).toEqual(4);
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
        tagIDs: [privateTags[0][0].id],
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
        tagIDs: [privateTags[0][0].id],
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
  });
});
