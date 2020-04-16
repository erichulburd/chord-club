import { makeDBPool, TestDBClientManager, DBTxManager } from '../../repositories/db';
import { PoolClient } from 'pg';
import { initializeApp } from '../../util/app';
import supertest from 'supertest';
import { getTestKey, signWithTestKey } from '../../../tests/testingKeys';
import { makeUserNew } from '../../../tests/factories';
import { insertUserNew } from '../../repositories/user';
import express from 'express';


describe('user repository', () => {
  const pool = makeDBPool();
  let dbClientManager: TestDBClientManager;
  let app: express.Express;
  let client: PoolClient;
  let txManager: DBTxManager;
  let graphql: supertest.Test;
  const token = signWithTestKey({ uid: 'uid' });

  beforeEach(async () => {
    dbClientManager = new TestDBClientManager(pool);
    app = initializeApp(dbClientManager, getTestKey);
    const conn = await dbClientManager.newConnection();
    client = conn[0];
    txManager = conn[1];
    graphql = supertest(app)
      .post('/graphql')
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);
  });

  afterEach(async () => {
    await dbClientManager.rollbackAndRelease();
  });

  afterAll(async () => {
    await pool.end();
  });

  test('basic tag operations', async () => {
    await insertUserNew(makeUserNew(), 'uid1', client);
    await insertUserNew(makeUserNew(), 'uid2', client);
    await insertUserNew(makeUserNew(), 'uid3', client);
    const res = await graphql.send({
      query: `
        query {
          users(query: { uid: "uid1" }) {
            uid username
          }
        }
      `,
      variables: {},
    }).expect(200);
    const { data, errors } = res.body;
    expect(errors).toEqual(undefined);
    expect(data.users.length).toEqual(1);
    expect(data.users[0].uid).toEqual('uid1');

  });
});
