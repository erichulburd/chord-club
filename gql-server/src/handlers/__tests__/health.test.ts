import { makeDBPool, TestDBClientManager, DBTxManager } from '../../repositories/db';
import { initializeApp } from '../../util/app';
import supertest from 'supertest';
import { getTestKey, signWithTestKey } from '../../../tests/testingKeys';
import express from 'express';

describe('extension queries', () => {
  const pool = makeDBPool();
  let dbClientManager: TestDBClientManager;
  let app: express.Express;

  beforeEach(async () => {
    dbClientManager = await TestDBClientManager.new(pool);
    app = initializeApp(dbClientManager, getTestKey);
  });

  afterEach(async () => {
    await dbClientManager.rollbackAndRelease();
  });

  afterAll(async () => {
    await pool.end();
  });

  test('returns uid if auth token provided', async () => {
    const token = signWithTestKey({ sub: 'uid' });
    const res = await supertest(app)
      .get('/v1/health')
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .send().expect(200);
    const { uid } = res.body;
    expect(uid).toEqual('uid');
  });

  test('returns undefined if auth token not provided', async () => {
    const res = await supertest(app)
      .get('/v1/health')
      .set('Accept', 'application/json').send().expect(200);
    const { uid } = res.body;
    expect(uid).toEqual(undefined);
  });
});
