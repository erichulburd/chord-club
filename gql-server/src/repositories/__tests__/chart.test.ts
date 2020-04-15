import { TestDBClientManager, makeDBPool, DBTxManager } from '../db';
import { PoolClient } from 'pg';
import { createNewChart, findChartByID, deleteChart, updateChart, deleteChartsForUser } from '../chart';
import { ChartNew, ChartUpdate } from '../../types';
import { makeChartNew } from '../../../tests/factories';
import { range } from 'lodash';

describe('chart repository', () => {
  const pool = makeDBPool();
  const dbClientManager = new TestDBClientManager(pool);
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
  afterAll(async () => {
    await pool.end();
  });

  test('create and find new chart', async () => {
    const chartNew: ChartNew = makeChartNew();
    const chart = await createNewChart(chartNew, 'uid', client);
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
      const chart = await createNewChart(chartNew, 'uid', client);
      return chart.id;
    }));
    const chartIDs1 = await Promise.all(range(3).map(async (i) => {
      const chartNew: ChartNew = makeChartNew();
      const chart = await createNewChart(chartNew, 'uid2', client);
      return chart.id;
    }));

    await deleteChartsForUser('uid', client);
    let charts = await Promise.all(chartIDs.map(async (chartID) => findChartByID(chartID, 'uid', client)));
    expect(charts.every((c) => c === undefined)).toEqual(true);
    charts = await Promise.all(chartIDs1.map(async (chartID) => findChartByID(chartID, 'uid2', client)));
    expect(charts.some((c) => c === undefined)).toEqual(false);
  });

  test('executeChartQuery', async () => {
    const query: ChartQuery = {};
    const chartIDs = await Promise.all(range(5).map(async (i) => {
      const chartNew: ChartNew = makeChartNew();
      const chart = await createNewChart(chartNew, 'uid', client);
      return chart.id;
    }));
    const chartIDs1 = await Promise.all(range(3).map(async (i) => {
      const chartNew: ChartNew = makeChartNew();
      const chart = await createNewChart(chartNew, 'uid2', client);
      return chart.id;
    }));

    await deleteChartsForUser('uid', client);
    let charts = await Promise.all(chartIDs.map(async (chartID) => findChartByID(chartID, 'uid', client)));
    expect(charts.every((c) => c === undefined)).toEqual(true);
    charts = await Promise.all(chartIDs1.map(async (chartID) => findChartByID(chartID, 'uid2', client)));
    expect(charts.some((c) => c === undefined)).toEqual(false);
  });

});
