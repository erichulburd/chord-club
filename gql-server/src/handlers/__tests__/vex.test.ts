import { makeDBPool, TestDBClientManager, DBTxManager } from '../../repositories/db';
import { PoolClient } from 'pg';
import { initializeApp } from '../../util/app';
import supertest from 'supertest';
import { getTestKey, signWithTestKey } from '../../../tests/testingKeys';
import { makeTagNew } from '../../../tests/factories';
import { findTagByID } from '../../repositories/tag';
import express from 'express';
import { TagQuery, BaseScopes, TagType, Tag, TagNew } from '../../types';
import { insertNewTags } from '../../repositories/tag';
import { Score } from '../../util/vexEasyScore';


describe('vex creation', () => {
  const pool = makeDBPool();
  let dbClientManager: TestDBClientManager;
  let app: express.Express;
  let client: PoolClient;
  let txManager: DBTxManager;
  let vexReq: () => supertest.Test;
  const token = signWithTestKey({ sub: 'uid' });

  beforeEach(async () => {
    dbClientManager = new TestDBClientManager(pool);
    app = initializeApp(dbClientManager, getTestKey);
    const conn = await dbClientManager.newConnection();
    client = conn[0];
    txManager = conn[1];
    vexReq = () => supertest(app)
      .post('/v1/vex')
      .set('Content-Type', 'application/json')
      .set('Accept', 'image/svg+xml')
      .set('Authorization', `Bearer ${token}`);
  });

  afterEach(async () => {
    await dbClientManager.rollbackAndRelease();
  });

  afterAll(async () => {
    await pool.end();
  });

  test('basic query', async () => {
    const score: Score = {
      staves: [
        { cleff: 'treble', voices: [{ notes: '(C#5 B4 A4 G#4)/w' }]},
        { cleff: 'bass', voices: [{ notes: '(C#2 G3)/w' }]},
      ]
    };
    const res1 = await vexReq().send({
      score,
    }).expect(200);
    const svg= res1.body;
    console.info('svg', svg.toString())
  });
});
