import { makeDBPool, TestDBClientManager, DBTxManager } from '../db';
import { PoolClient } from 'pg';
import { insertNewChart } from '../chart';
import { makeChartNew, makeUserNew } from '../../../tests/factories';
import { upsertReactionNew, countReactions, findReactionsByChartID } from '../reaction';
import { insertUserNew } from '../user';
import { ReactionNew, ReactionType } from '../../types';

describe('reaction repository', () => {
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

    test('insert and count reactions', async () => {
      await insertUserNew(makeUserNew(), 'uid', client);
      await insertUserNew(makeUserNew(), 'uid1', client);
      await insertUserNew(makeUserNew(), 'uid2', client);
      const chart1 = await insertNewChart(makeChartNew(), 'uid', client);
      const chart2 = await insertNewChart(makeChartNew(), 'uid', client);
      const chart3 = await insertNewChart(makeChartNew(), 'uid', client);
      await insertNewChart(makeChartNew(), 'uid', client);

      const reaction: ReactionNew = { uid: 'uid', chartID: chart1.id, reactionType: ReactionType.Star };
      await upsertReactionNew(reaction, client);
      let counts = await countReactions([chart1.id, chart2.id, chart3.id], client);
      expect(counts[0].stars).toEqual(1);
      expect(counts[0].flags).toEqual(0);
      expect(counts[1].stars).toEqual(0);
      expect(counts[1].flags).toEqual(0);
      expect(counts[2].stars).toEqual(0);
      expect(counts[2].flags).toEqual(0);

      await upsertReactionNew({ uid: 'uid1', chartID: chart1.id, reactionType: ReactionType.Star }, client);
      await upsertReactionNew({ uid: 'uid2', chartID: chart1.id, reactionType: ReactionType.Star }, client);
      await upsertReactionNew({ uid: 'uid', chartID: chart3.id, reactionType: ReactionType.Star }, client);
      await upsertReactionNew({ uid: 'uid1', chartID: chart3.id, reactionType: ReactionType.Flag }, client);
      await upsertReactionNew({ uid: 'uid2', chartID: chart3.id, reactionType: ReactionType.Flag }, client);

      counts = await countReactions([chart1.id, chart2.id, chart3.id], client);
      expect(counts[0].stars).toEqual(3);
      expect(counts[0].flags).toEqual(0);
      expect(counts[1].stars).toEqual(0);
      expect(counts[1].flags).toEqual(0);
      expect(counts[2].stars).toEqual(1);
      expect(counts[2].flags).toEqual(2);

      let reactions =
        await findReactionsByChartID([chart1.id, chart2.id, chart3.id], 'uid', client);
      expect(reactions[0]).toEqual(ReactionType.Star);
      expect(reactions[1]).toEqual(undefined);
      expect(reactions[2]).toEqual(ReactionType.Star);

      reactions =
        await findReactionsByChartID([chart1.id, chart2.id, chart3.id], 'uid1', client);
      expect(reactions[0]).toEqual(ReactionType.Star);
      expect(reactions[1]).toEqual(undefined);
      expect(reactions[2]).toEqual(ReactionType.Flag);
    });

    test('upsert existing reaction', async () => {
      await insertUserNew(makeUserNew(), 'uid', client);
      const chart1 = await insertNewChart(makeChartNew(), 'uid', client);
      const reaction: ReactionNew = { uid: 'uid', chartID: chart1.id, reactionType: ReactionType.Star };
      await upsertReactionNew(reaction, client);
      reaction.reactionType = ReactionType.Flag;
      await upsertReactionNew(reaction, client)
      const rxns = await findReactionsByChartID([chart1.id], 'uid', client);
      expect(rxns[0]).toEqual(ReactionType.Flag);
    });
  });
});
