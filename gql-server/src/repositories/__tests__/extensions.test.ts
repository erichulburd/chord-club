import { makeDBPool, TestDBClientManager, DBTxManager } from '../db';
import { PoolClient } from 'pg';
import { makeExtension, makeChartNew } from '../../../tests/factories';
import { insertExtensions, findAllExtensions, addExtensionsForChart, findExtensionsForCharts, removeExtensionsForChart } from '../extensions';
import { insertNewChart } from '../chart';


describe('extensions repository', () => {
  const pool = makeDBPool();
  let dbClientManager: TestDBClientManager;
  afterAll(async () => {
    await pool.end();
  });

  describe('basic extension operations', () => {
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

    test('insertExtensions', async () => {
      const extensions =
        await insertExtensions([
          makeExtension({ degree: 9 }),
          makeExtension({ degree: 6 }),
          makeExtension({ degree: 7 }),
      ], client);
      expect(extensions.length).toEqual(3);
      expect(extensions.every((e) => e.id !== undefined)).toEqual(true);
    });

    test('findAllExtensions', async () => {
      await insertExtensions([
        makeExtension({ degree: 9 }),
        makeExtension({ degree: 6 }),
        makeExtension({ degree: 7 }),
      ], client);
      const extensions = await findAllExtensions(client);
      expect(extensions.length).toEqual(3);
      expect(extensions.every((e) => [9, 6, 7].includes(e.degree)));
    });

    test('add find and remove extensions for chart', async () => {
      const extensions = await insertExtensions([
        makeExtension({ degree: 9 }),
        makeExtension({ degree: 6 }),
        makeExtension({ degree: 7 }),
      ], client);
      const chart1 = await insertNewChart(makeChartNew(), 'uid', client);
      const chart2 = await insertNewChart(makeChartNew(), 'uid', client);
      const chart3 = await insertNewChart(makeChartNew(), 'uid', client);
      await insertNewChart(makeChartNew(), 'uid1', client);
      const extensionIDs = extensions.map((e) => e.id);
      await addExtensionsForChart(chart1.id, extensionIDs, client);
      await addExtensionsForChart(chart3.id, extensionIDs.slice(0, 2), client);
      let extensionss =
        await findExtensionsForCharts([chart1.id, chart2.id, chart3.id], client);
      expect(extensionss[0].length).toEqual(3);
      expect(extensionss[0].every((e) => extensionIDs.includes(e.id))).toEqual(true);
      expect(extensionss[1].length).toEqual(0);
      expect(extensionss[2].length).toEqual(2);
      expect(extensionss[2].every((e) => extensionIDs.indexOf(e.id) < 2)).toEqual(true);

      await removeExtensionsForChart(chart1.id, extensionIDs.slice(0, 2), client);
      extensionss =
        await findExtensionsForCharts([chart1.id, chart2.id, chart3.id], client);
      expect(extensionss[0].length).toEqual(1);
      expect(extensionss[0][0].id).toEqual(extensionIDs[2]);
      expect(extensionss[1].length).toEqual(0);
      expect(extensionss[2].length).toEqual(2);
      expect(extensionss[2].every((e) => extensionIDs.indexOf(e.id) < 2)).toEqual(true);
    });

  });

});
