import { makeDBPool, TestDBClientManager, DBTxManager } from '../db';
import { PoolClient } from 'pg';
import { insertNewChart } from '../chart';
import { makeChartNew, makeUserNew } from '../../../tests/factories';
import { insertReactionNew, countReactions } from '../reaction';
import { insertUserNew } from '../user';
import { ReactionNew, ReactionType } from '../../types';
import { ApolloError } from 'apollo-server-express';

describe('reaction repository', () => {
  const pool = makeDBPool();
  const dbClientManager = new TestDBClientManager(pool);
  afterAll(async () => {
    await pool.end();
  });

  describe('basic extension operations', () => {
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

    test('insert and count reactions', async () => {
      await insertUserNew(makeUserNew(), 'uid', client);
      await insertUserNew(makeUserNew(), 'uid1', client);
      await insertUserNew(makeUserNew(), 'uid2', client);
      const chart1 = await insertNewChart(makeChartNew(), 'uid', client);
      const chart2 = await insertNewChart(makeChartNew(), 'uid', client);
      const chart3 = await insertNewChart(makeChartNew(), 'uid', client);
      await insertNewChart(makeChartNew(), 'uid', client);

      const reaction: ReactionNew = { uid: 'uid', chartID: chart1.id, reactionType: ReactionType.Star };
      await insertReactionNew(reaction, client);
      let counts = await countReactions([chart1.id, chart2.id, chart3.id], client);
      expect(counts[0].stars).toEqual(1);
      expect(counts[0].flags).toEqual(0);
      expect(counts[1].stars).toEqual(0);
      expect(counts[1].flags).toEqual(0);
      expect(counts[2].stars).toEqual(0);
      expect(counts[2].flags).toEqual(0);

      await insertReactionNew({ uid: 'uid1', chartID: chart1.id, reactionType: ReactionType.Star }, client);
      await insertReactionNew({ uid: 'uid2', chartID: chart1.id, reactionType: ReactionType.Star }, client);
      await insertReactionNew({ uid: 'uid', chartID: chart3.id, reactionType: ReactionType.Star }, client);
      await insertReactionNew({ uid: 'uid1', chartID: chart3.id, reactionType: ReactionType.Flag }, client);
      await insertReactionNew({ uid: 'uid2', chartID: chart3.id, reactionType: ReactionType.Flag }, client);

      counts = await countReactions([chart1.id, chart2.id, chart3.id], client);
      expect(counts[0].stars).toEqual(3);
      expect(counts[0].flags).toEqual(0);
      expect(counts[1].stars).toEqual(0);
      expect(counts[1].flags).toEqual(0);
      expect(counts[2].stars).toEqual(1);
      expect(counts[2].flags).toEqual(2);
    });

    test('insert duplicate reaction', async () => {
      await insertUserNew(makeUserNew(), 'uid', client);
      const chart1 = await insertNewChart(makeChartNew(), 'uid', client);
      const reaction: ReactionNew = { uid: 'uid', chartID: chart1.id, reactionType: ReactionType.Star };
      await insertReactionNew(reaction, client);
      reaction.reactionType = ReactionType.Flag;
      expect(
        insertReactionNew(reaction, client)
      ).rejects.toThrowError(ApolloError);
    });
  });
});
