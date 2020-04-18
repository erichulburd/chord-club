import { makeDBPool, TestDBClientManager, DBTxManager } from '../../repositories/db';
import { PoolClient } from 'pg';
import { initializeApp } from '../../util/app';
import supertest from 'supertest';
import { getTestKey, signWithTestKey } from '../../../tests/testingKeys';
import { makeUserNew } from '../../../tests/factories';
import { insertUserNew, findUserByUID } from '../../repositories/user';
import express from 'express';


describe('user queries', () => {
  const pool = makeDBPool();
  let dbClientManager: TestDBClientManager;
  let app: express.Express;
  let client: PoolClient;
  let txManager: DBTxManager;
  let graphql: () => supertest.Test;
  const token = signWithTestKey({ uid: 'uid' });

  beforeEach(async () => {
    dbClientManager = new TestDBClientManager(pool);
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

  test('basic query', async () => {
    await insertUserNew(makeUserNew(), 'uid1', client);
    await insertUserNew(makeUserNew(), 'uid2', client);
    await insertUserNew(makeUserNew(), 'uid3', client);
    const res = await graphql().send({
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

  test('open query with after', async () => {
    await insertUserNew(makeUserNew(), 'uid1', client);
    await insertUserNew(makeUserNew(), 'uid2', client);
    await insertUserNew(makeUserNew(), 'uid3', client);
    await insertUserNew(makeUserNew(), 'uid4', client);
    await insertUserNew(makeUserNew(), 'uid5', client);
    let res = await graphql().send({
      query: `
        query {
          users(query: {}) {
            uid username
          }
        }
      `,
      variables: {},
    }).expect(200);
    let { data, errors } = res.body;
    expect(errors).toEqual(undefined);
    expect(data.users.length).toEqual(5);

    res = await graphql().send({
      query: `
        query ($query: UserQuery!){
          users(query: $query) {
            uid username
          }
        }
      `,
      variables: { query: { after: data.users[3].uid } },
    }).expect(200);
    expect(errors).toEqual(res.body.errors);
    expect(res.body.data.users.length).toEqual(1);
    expect(res.body.data.users[0].uid).toEqual(data.users[4].uid);
  });

  test('CRUD mutations', async () => {
    const res1 = await graphql().send({
      query: `
        mutation ($newUser: UserNew!) {
          createUser(newUser: $newUser) {
            uid username
          }
        }
      `,
      variables: {
        newUser: { username: 'yada'  }
      },
    }).expect(200);
    const { data, errors } = res1.body;
    expect(errors).toEqual(undefined);
    expect(data.createUser.uid).toEqual('uid');
    expect(data.createUser.username).toEqual('yada');

    const res2 = await graphql().send({
      query: `
        mutation ($userUpdate: UserUpdate!) {
          updateUser(userUpdate: $userUpdate) {
            uid username
          }
        }
      `,
      variables: {
        userUpdate: { username: 'yada2'  }
      },
    }).expect(200);
    const body2 = res2.body;
    expect(body2.errors).toEqual(undefined);
    expect(body2.data.updateUser.uid).toEqual('uid');
    expect(body2.data.updateUser.username).toEqual('yada2');

    const res3 = await graphql().send({
      query: `
        mutation ($uid: String!) {
          deleteUser(userID: $uid) { empty }
        }
      `,
      variables: {
        uid: 'uid',
      },
    }).expect(200);
    const body3 = res3.body;
    expect(body3.errors).toEqual(undefined);

    const user = await findUserByUID('uid', client);
    expect(user).toEqual(undefined);
  });
});
