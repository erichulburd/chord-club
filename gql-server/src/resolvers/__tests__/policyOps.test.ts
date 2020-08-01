import { makeDBPool, TestDBClientManager, DBTxManager } from '../../repositories/db';
import { PoolClient } from 'pg';
import { initializeApp } from '../../util/app';
import supertest from 'supertest';
import { getTestKey, signWithTestKey } from '../../../tests/testingKeys';
import { makeUserNew, makeTagNew } from '../../../tests/factories';
import express from 'express';
import { PolicyResourceType, PolicyAction, TagType, Tag, PolicyQuery, NewPolicy, Policy, ErrorType } from '../../types';
import { insertUserNew } from '../../repositories/user';
import { insertNewTags } from '../../repositories/tag';
import { findPolicyByID } from '../../repositories/policy';
import moment from 'moment';
import { ForbiddenError } from 'apollo-server';

describe('policy ops', () => {
  const pool = makeDBPool();
  let dbClientManager: TestDBClientManager;
  let app: express.Express;
  let client: PoolClient;
  let txManager: DBTxManager;
  let graphql: (t: string) => supertest.Test;
  const token = signWithTestKey({ sub: 'uid' });
  const token1 = signWithTestKey({ sub: 'uid1' });
  let tags: Tag[][] = [];

  beforeEach(async () => {
    dbClientManager = await TestDBClientManager.new(pool);
    app = initializeApp(dbClientManager, getTestKey);
    const conn = await dbClientManager.newConnection();
    client = conn[0];
    txManager = conn[1];
    graphql = (t: string) => supertest(app)
      .post('/graphql')
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${t}`);

    await insertUserNew(makeUserNew(), 'uid', client);
    await insertUserNew(makeUserNew(), 'uid1', client);
    await insertUserNew(makeUserNew(), 'uid2', client);
    tags = await Promise.all(['uid', 'uid1'].map(async (uid) => {
      return insertNewTags([
        makeTagNew({ tagType: TagType.List }),
        makeTagNew({ tagType: TagType.Descriptor }),
      ], uid, client);
    }));
  });

  afterEach(async () => {
    await dbClientManager.rollbackAndRelease();
  });
  afterAll(async () => {
    await pool.end();
  });

  test('non-resource owner cannot create policy', async () => {
    const expiresAt = moment().add(30, 'days').utc();
    const policy: NewPolicy = {
      uid: 'uid1',
      resourceType: PolicyResourceType.Tag,
      resourceID: tags[0][0].id,
      action: PolicyAction.Read,
      expiresAt: expiresAt.utc().format(),
    };
    let res = await graphql(token1).send({
      query: `
        mutation CreatePolicy($policy: NewPolicy!) {
          createPolicy(policy: $policy) {
            id resourceType resourceID expiresAt user { uid username }
          }
        }
      `,
      variables: {
        policy,
      },
    });
    expect(res.body.errors[0].extensions.code).toEqual(ErrorType.ForbiddenResourceOperation);
    expect(res.body.errors).not.toEqual(undefined);
  });

  test('create policy without expiration', async () => {
    const expiresAt = moment().add(30, 'days').utc();
    const policy: NewPolicy = {
      uid: 'uid1',
      resourceType: PolicyResourceType.Tag,
      resourceID: tags[0][0].id,
      action: PolicyAction.Read,
      expiresAt: expiresAt.utc().format(),
    };
    let res = await graphql(token).send({
      query: `
        mutation CreatePolicy($policy: NewPolicy!) {
          createPolicy(policy: $policy) {
            id resourceType resourceID expiresAt user { uid username }
          }
        }
      `,
      variables: {
        policy,
      },
    });
    const { data, errors } = res.body;
    expect(errors).toEqual(undefined);
    const returnedPolicy: Policy = data.createPolicy
    let savedPolicy = await findPolicyByID(returnedPolicy.id, client);
    if (savedPolicy === undefined) {
      expect(savedPolicy).not.toEqual(undefined);
      return
    }
    expect(savedPolicy.action).toEqual(PolicyAction.Read);
    expect(savedPolicy.resourceID).toEqual(tags[0][0].id);
    expect(savedPolicy.resourceType).toEqual(PolicyResourceType.Tag);
    expect(moment(savedPolicy.expiresAt).utc().format()).toEqual(expiresAt.format());

    const query: PolicyQuery = {
      resource: {
        resourceID: savedPolicy.resourceID,
        resourceType: savedPolicy.resourceType,
      }
    };
    res = await graphql(token).send({
      query: `
        query Policies($query: PolicyQuery!) {
          policies(query: $query) {
            id resourceType resourceID expiresAt user { uid username }
          }
        }
      `,
      variables: {
        query,
      },
    }).expect(200);
    let policies: Policy[] = res.body.data.policies;
    expect(policies.length).toEqual(1);
    expect(policies[0].id).toEqual(savedPolicy.id);
    expect(policies[0].expiresAt).toEqual(savedPolicy.expiresAt);

    res = await graphql(token).send({
      query: `
        mutation DeletePolicy($policyID: Int!) {
          deletePolicy(policyID: $policyID) {
            empty
          }
        }
      `,
      variables: {
        policyID: savedPolicy.id,
      },
    });
    expect(res.body.errors).toEqual(undefined);

    res = await graphql(token).send({
      query: `
        query Policies($query: PolicyQuery!) {
          policies(query: $query) {
            id resourceType resourceID expiresAt user { uid username }
          }
        }
      `,
      variables: {
        query,
      },
    }).expect(200);
    expect(res.body.errors).toEqual(undefined);
    policies = res.body.data.policies;
    expect(policies.length).toEqual(0);
  });

  test('random user cannot list policies', async () => {
    const expiresAt = moment().add(30, 'days').utc();
    const policy: NewPolicy = {
      uid: 'uid1',
      resourceType: PolicyResourceType.Tag,
      resourceID: tags[0][0].id,
      action: PolicyAction.Read,
      expiresAt: expiresAt.utc().format(),
    };
    let res = await graphql(token).send({
      query: `
        mutation CreatePolicy($policy: NewPolicy!) {
          createPolicy(policy: $policy) {
            id resourceType resourceID expiresAt user { uid username }
          }
        }
      `,
      variables: {
        policy,
      },
    });
    const { data, errors } = res.body;
    expect(errors).toEqual(undefined);

    const query: PolicyQuery = {
      resource: {
        resourceID: policy.resourceID,
        resourceType: policy.resourceType,
      }
    };
    res = await graphql(signWithTestKey({ sub: 'randomuser' })).send({
      query: `
        query Policies($query: PolicyQuery!) {
          policies(query: $query) {
            id resourceType resourceID expiresAt user { uid username }
          }
        }
      `,
      variables: {
        query,
      },
    }).expect(200);
    expect(res.body.errors).not.toEqual(undefined);
    expect(res.body.errors[0].extensions.code).toEqual(ErrorType.ForbiddenResourceOperation);
  });

  test('subject can delete policy', async () => {
    const expiresAt = moment().add(30, 'days').utc();
    const policy: NewPolicy = {
      uid: 'uid1',
      resourceType: PolicyResourceType.Tag,
      resourceID: tags[0][0].id,
      action: PolicyAction.Read,
      expiresAt: expiresAt.utc().format(),
    };
    let res = await graphql(token).send({
      query: `
        mutation CreatePolicy($policy: NewPolicy!) {
          createPolicy(policy: $policy) {
            id resourceType resourceID expiresAt user { uid username }
          }
        }
      `,
      variables: {
        policy,
      },
    });
    const { data, errors } = res.body;
    expect(errors).toEqual(undefined);
    const returnedPolicy: Policy = data.createPolicy

    let savedPolicy = await findPolicyByID(returnedPolicy.id, client);
    if (savedPolicy === undefined) {
      expect(savedPolicy).toEqual(undefined);
      return;
    }

    res = await graphql(token).send({
      query: `
        mutation DeletePolicy($policyID: Int!) {
          deletePolicy(policyID: $policyID) {
            empty
          }
        }
      `,
      variables: {
        policyID: savedPolicy.id,
      },
    });
    expect(res.body.errors).toEqual(undefined);

    savedPolicy = await findPolicyByID(returnedPolicy.id, client);
    expect(savedPolicy).toEqual(undefined);
  })

  test('random user cannot delete policy', async () => {
    const expiresAt = moment().add(30, 'days').utc();
    const policy: NewPolicy = {
      uid: 'uid1',
      resourceType: PolicyResourceType.Tag,
      resourceID: tags[0][0].id,
      action: PolicyAction.Read,
      expiresAt: expiresAt.utc().format(),
    };
    let res = await graphql(token).send({
      query: `
        mutation CreatePolicy($policy: NewPolicy!) {
          createPolicy(policy: $policy) {
            id resourceType resourceID expiresAt user { uid username }
          }
        }
      `,
      variables: {
        policy,
      },
    });
    const { data, errors } = res.body;
    expect(errors).toEqual(undefined);
    const returnedPolicy: Policy = data.createPolicy

    let savedPolicy = await findPolicyByID(returnedPolicy.id, client);
    if (savedPolicy === undefined) {
      expect(savedPolicy).toEqual(undefined);
      return;
    }

    res = await graphql(signWithTestKey({ sub: 'randomuser' })).send({
      query: `
        mutation DeletePolicy($policyID: Int!) {
          deletePolicy(policyID: $policyID) {
            empty
          }
        }
      `,
      variables: {
        policyID: savedPolicy.id,
      },
    });
    expect(res.body.errors[0].extensions.code).toEqual(ErrorType.ForbiddenResourceOperation);
    expect(res.body.errors).not.toEqual(undefined);

    savedPolicy = await findPolicyByID(returnedPolicy.id, client);
    expect(savedPolicy).not.toEqual(undefined);
  });
});
