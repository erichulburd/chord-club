import { makeDBPool, TestDBClientManager, DBTxManager } from '../../repositories/db';
import { PoolClient } from 'pg';
import { initializeApp } from '../../util/app';
import supertest from 'supertest';
import { getTestKey, signWithTestKey } from '../../../tests/testingKeys';
import { makeChartNew, makeUserNew } from '../../../tests/factories';
import express from 'express';
import { insertNewChart } from '../../repositories/chart';
import { insertUserNew } from '../../repositories/user';
import { ReactionNew, ReactionType, Chart } from '../../types';


describe('reaction ops', () => {
  const pool = makeDBPool();
  let dbClientManager: TestDBClientManager;
  let app: express.Express;
  let client: PoolClient;
  let txManager: DBTxManager;
  let graphql: (token?: string) => supertest.Test;
  const token = signWithTestKey({ sub: 'uid' });

  beforeEach(async () => {
    dbClientManager = await TestDBClientManager.new(pool);
    app = initializeApp(dbClientManager, getTestKey);
    const conn = await dbClientManager.newConnection();
    client = conn[0];
    txManager = conn[1];
    graphql = (t = token) => supertest(app)
      .post('/graphql')
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${t}`);
  });

  afterEach(async () => {
    await dbClientManager.rollbackAndRelease();
  });

  afterAll(async () => {
    await pool.end();
  });

  test('react and view reactions', async () => {
    await insertUserNew(makeUserNew(), 'uid', client);
    await insertUserNew(makeUserNew(), 'uid1', client);
    await insertUserNew(makeUserNew(), 'uid2', client);
    const charts = await Promise.all(
      ['uid', 'uid1', 'uid2'].map(async (uid) => {
        const c1 = await insertNewChart(makeChartNew(), uid, client);
        const c2 = await insertNewChart(makeChartNew(), uid, client);
        const c3 = await insertNewChart(makeChartNew(), uid, client);
        return [c1, c2, c3];
      })
    );

    const reaction: ReactionNew = {
      chartID: charts[0][0].id,
      uid: 'uid',
      reactionType: ReactionType.Star,
    };
    const res1 = await graphql().send({
      query: `
        mutation ($reactionNew: ReactionNew!) {
          react(reactionNew: $reactionNew) {
            reactionCounts { stars flags } userReactionType
          }
        }
      `,
      variables: {
        reactionNew: reaction,
      },
    }).expect(200);
    const chart: Partial<Chart> = res1.body.data.react;
    expect(chart.reactionCounts?.stars).toEqual(1);
    expect(chart.reactionCounts?.flags).toEqual(0);
    expect(chart.userReactionType).toEqual(ReactionType.Star);

    reaction.reactionType = ReactionType.Flag;
    const res2 = await graphql().send({
      query: `
        mutation ($reactionNew: ReactionNew!) {
          react(reactionNew: $reactionNew) {
            reactionCounts { stars flags } userReactionType
          }
        }
      `,
      variables: {
        reactionNew: reaction,
      },
    }).expect(200);
    const chart2: Partial<Chart> = res2.body.data.react;
    expect(chart2.reactionCounts?.stars).toEqual(0);
    expect(chart2.reactionCounts?.flags).toEqual(1);
    expect(chart2.userReactionType).toEqual(ReactionType.Flag);

    const token2 = signWithTestKey({ sub: 'uid2' });
    reaction.uid = 'uid2';
    reaction.chartID = charts[2][0].id
    const res3 = await graphql(token2).send({
      query: `
        mutation ($reactionNew: ReactionNew!) {
          react(reactionNew: $reactionNew) {
            reactionCounts { stars flags } userReactionType
          }
        }
      `,
      variables: {
        reactionNew: reaction,
      },
    }).expect(200);
    const chart3: Partial<Chart> = res3.body.data.react;
    expect(chart3.reactionCounts?.stars).toEqual(0);
    expect(chart3.reactionCounts?.flags).toEqual(1);
    expect(chart3.userReactionType).toEqual(ReactionType.Flag);
  });

  test('toggle reaction', async () => {
    const uid = 'uid';
    await insertUserNew(makeUserNew(), uid, client);
    const c1 = await insertNewChart(makeChartNew(), uid, client);
    const c2 = await insertNewChart(makeChartNew(), uid, client);
    const c3 = await insertNewChart(makeChartNew(), uid, client);
    const charts = [c1, c2, c3];

    const reaction: ReactionNew = {
      chartID: charts[0].id,
      uid,
      reactionType: ReactionType.Star,
    };
    const res1 = await graphql().send({
      query: `
        mutation ($reactionNew: ReactionNew!) {
          react(reactionNew: $reactionNew) {
            reactionCounts { stars flags } userReactionType
          }
        }
      `,
      variables: {
        reactionNew: reaction,
      },
    }).expect(200);
    const chart: Partial<Chart> = res1.body.data.react;
    expect(chart.reactionCounts?.stars).toEqual(1);
    expect(chart.reactionCounts?.flags).toEqual(0);
    expect(chart.userReactionType).toEqual(ReactionType.Star);

    const res2 = await graphql().send({
      query: `
        mutation ($reactionNew: ReactionNew!) {
          react(reactionNew: $reactionNew) {
            reactionCounts { stars flags } userReactionType
          }
        }
      `,
      variables: {
        reactionNew: reaction,
      },
    }).expect(200);
    const chart2: Partial<Chart> = res2.body.data.react;
    expect(chart2.reactionCounts?.stars).toEqual(0);
    expect(chart2.reactionCounts?.flags).toEqual(0);
    expect(chart2.userReactionType).toEqual(null);
  });

});

