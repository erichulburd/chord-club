import { makeDBPool, TestDBClientManager, DBTxManager } from '../../repositories/db';
import { PoolClient } from 'pg';
import { initializeApp } from '../../util/app';
import supertest from 'supertest';
import { getTestKey, signWithTestKey } from '../../../tests/testingKeys';
import { makeUserNew, makeExtension } from '../../../tests/factories';
import { insertUserNew } from '../../repositories/user';
import express from 'express';
import { insertExtensions } from '../../repositories/extensions';
import { Extension } from '../../types';


describe('extension queries', () => {
  const pool = makeDBPool();
  let dbClientManager: TestDBClientManager;
  let app: express.Express;
  let client: PoolClient;
  let txManager: DBTxManager;
  let graphql: () => supertest.Test;
  const token = signWithTestKey({ sub: 'uid' });

  beforeEach(async () => {
    dbClientManager = await TestDBClientManager.new(pool);
    app = initializeApp(dbClientManager, getTestKey);
    const conn = await dbClientManager.newConnection();
    client = conn[0];
    txManager = conn[1];
    graphql = () => supertest(app)
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

  test('list all extensions', async () => {
    await insertExtensions([
      makeExtension({ degree: 9 }),
      makeExtension({ degree: 6 }),
      makeExtension({ degree: 7 }),
    ], client);
    const res = await graphql().send({
      query: `
        query {
          extensions {
            id extensionType degree
          }
        }
      `,
      variables: {},
    }).expect(200);
    const { data, errors } = res.body;
    expect(errors).toEqual(undefined);
    expect(data.extensions.length).toEqual(3);
    expect(data.extensions.every((e: Extension) => [6, 7, 9].includes(e.degree)))
      .toEqual(true);
  });
});
