import { makeDBPool, TestDBClientManager, DBTxManager } from '../../repositories/db';
import { PoolClient } from 'pg';
import { initializeApp } from '../../util/app';
import supertest from 'supertest';
import { getTestKey, signWithTestKey } from '../../../tests/testingKeys';
import { makeTagNew } from '../../../tests/factories';
import { findTagByID } from '../../repositories/tag';
import express from 'express';
import { TagQuery, TagType, Tag, TagNew, PolicyResourceType, PolicyAction } from '../../types';
import { insertNewTags } from '../../repositories/tag';
import { insertPolicies } from '../../repositories/policy';


describe('tag ops', () => {
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
    // await txManager.commit(0);
    await dbClientManager.rollbackAndRelease();
  });

  afterAll(async () => {
    await pool.end();
  });

  test('basic query', async () => {
    const uids = ['uid', 'uid1'];
    await Promise.all(uids.map(async (uid) => {
      const tags  = await insertNewTags([
        makeTagNew({ tagType: TagType.List }),
        makeTagNew({ tagType: TagType.Descriptor }),
        makeTagNew({ tagType: TagType.List }),
        makeTagNew({ tagType: TagType.Descriptor }),
      ], uid, client);
      await insertPolicies([
        {
          resourceType: PolicyResourceType.Tag, resourceID: tags[0].id,
          uid: uids.find(id => id !== uid) || '', action: PolicyAction.Wildcard,
        }, {
          resourceType: PolicyResourceType.Tag, resourceID: tags[1].id,
          uid: uids.find(id => id !== uid) || '', action: PolicyAction.Wildcard,
        },
      ], uid, client);
    }));
    const query: TagQuery = {
      tagTypes: [TagType.Descriptor, TagType.List]
    }
    const res1 = await graphql().send({
      query: `
        query ($query: TagQuery!){
          tags(query: $query) {
            id munge displayName tagType
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
            id munge displayName tagType
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
  });

  test('query by tag ids', async () => {
    const tagss = await Promise.all(['uid', 'uid1'].map(async (uid) => {
      return insertNewTags([
        // makeTagNew({ tagType: TagType.List, scope: BaseScopes.Public }),
        makeTagNew({ tagType: TagType.List }),
        // makeTagNew({ tagType: TagType.Descriptor, scope: BaseScopes.Public }),
        makeTagNew({ tagType: TagType.Descriptor }),
        makeTagNew({ tagType: TagType.List }),
        makeTagNew({ tagType: TagType.Descriptor }),
      ], uid, client);
    }));
    const tagIDs = tagss[0].map(t => t.id).slice(0, 3);
    const query: TagQuery = {
      ids: tagIDs,
      // scopes: ['uid'.Public],
      tagTypes: [TagType.Descriptor, TagType.List]
    }
    const res1 = await graphql().send({
      query: `
        query ($query: TagQuery!){
          tags(query: $query) {
            id munge displayName tagType
          }
        }
      `,
      variables: { query },
    }).expect(200);
    const { data, errors } = res1.body;
    expect(errors).toEqual(undefined);
    expect(data.tags.length).toEqual(3);
    expect(data.tags.every((t: Tag) => tagIDs.some(tagID => tagID === t.id))).toEqual(true);
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
            id munge displayName tagType createdBy
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

    const tag = await findTagByID(tags[0].id, tags[0].createdBy, client);
    expect(tag).toEqual(undefined);
  });
});
