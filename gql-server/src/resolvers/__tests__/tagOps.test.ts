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


describe('tag ops', () => {
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
    await Promise.all(['uid', 'uid1'].map(async (uid) => {
      await insertNewTags([
        makeTagNew({ tagType: TagType.List, scope: BaseScopes.Public }),
        makeTagNew({ tagType: TagType.Descriptor, scope: BaseScopes.Public }),
        makeTagNew({ tagType: TagType.List, scope: uid }),
        makeTagNew({ tagType: TagType.Descriptor, scope: uid }),
      ], uid, client);
    }));
    const query: TagQuery = {
      scopes: ['uid', BaseScopes.Public],
      tagTypes: [TagType.Descriptor, TagType.List]
    }
    const res1 = await graphql().send({
      query: `
        query ($query: TagQuery!){
          tags(query: $query) {
            id munge displayName tagType scope
          }
        }
      `,
      variables: { query },
    }).expect(200);
    const { data, errors } = res1.body;
    expect(errors).toEqual(undefined);
    expect(data.tags.length).toEqual(6);
    expect(data.tags.every((t: Tag) => t.id !== undefined)).toEqual(true);

    query.tagTypes = [TagType.Descriptor];
    const res2 = await graphql().send({
      query: `
        query ($query: TagQuery!){
          tags(query: $query) {
            id munge displayName tagType scope
          }
        }
      `,
      variables: { query },
    }).expect(200);
    expect(errors).toEqual(undefined);
    expect(res2.body.data.tags.length).toEqual(3);
    expect(
      res2.body.data.tags.every((t: Tag) => t.tagType === TagType.Descriptor),
    ).toEqual(true);

    query.tagTypes = [TagType.Descriptor, TagType.List];
    query.scopes = ['uid'];
    const res3 = await graphql().send({
      query: `
        query ($query: TagQuery!){
          tags(query: $query) {
            id munge displayName tagType scope
          }
        }
      `,
      variables: { query },
    }).expect(200);
    expect(errors).toEqual(undefined);
    expect(res3.body.data.tags.length).toEqual(2);
    expect(
      res3.body.data.tags.every((t: Tag) => t.scope === 'uid'),
    ).toEqual(true);
  });

  test('CRUD mutations', async () => {
    const tagNews: TagNew[] = [
      makeTagNew(),
      makeTagNew(),
      makeTagNew(),
      makeTagNew(),
    ];
    const res1 = await graphql().send({
      query: `
        mutation ($tagNews: [TagNew!]!) {
          createTags(tagNews: $tagNews) {
            id munge displayName tagType scope createdBy
          }
        }
      `,
      variables: {
        tagNews,
      },
    }).expect(200);
    const { data, errors } = res1.body;
    const tags = data.createTags;
    expect(errors).toEqual(undefined);
    expect(tags.length).toEqual(4);
    expect(tags.every((t: Tag) => t.createdBy === 'uid')).toEqual(true);

    const res2 = await graphql().send({
      query: `
        mutation ($tagID: Int!) {
          deleteTag(tagID: $tagID) { empty }
        }
      `,
      variables: { tagID: tags[0].id },
    }).expect(200);
    const body2 = res2.body;
    expect(body2.errors).toEqual(undefined);

    const tag = await findTagByID(tags[0].id, [tags[0].scope], client);
    expect(tag).toEqual(undefined);
  });
});
