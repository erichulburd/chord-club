import { makeDBPool, TestDBClientManager, DBTxManager } from '../../repositories/db';
import { PoolClient } from 'pg';
import { initializeApp } from '../../util/app';
import supertest from 'supertest';
import { getTestKey, signWithTestKey } from '../../../tests/testingKeys';
import { makeUserNew, makeTagNew } from '../../../tests/factories';
import express from 'express';
import { NewInvitation, PolicyResourceType, PolicyAction, TagType, Tag, PolicyQuery, Invitation, InvitationQuery } from '../../types';
import { insertUserNew } from '../../repositories/user';
import { insertNewTags } from '../../repositories/tag';
import * as tokens from '../../util/tokens';
import { findInvitationByID } from '../../repositories/invitation';
import { listPolicies } from '../../repositories/policy';
import moment from 'moment';

describe('invitation ops', () => {
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

  test('create invitation without expiration', async () => {
    const invitation: NewInvitation = {
      resourceType: PolicyResourceType.Tag,
      resourceID: tags[0][0].id,
      action: PolicyAction.Wildcard,
    };
    let res = await graphql(token).send({
      query: `
        mutation CreateInvitation($invitation: NewInvitation!, $tokenExpirationHours: Int) {
          createInvitation(invitation: $invitation, tokenExpirationHours: $tokenExpirationHours) {
            token
          }
        }
      `,
      variables: {
        invitation, tokenExpirationHours: undefined,
      },
    }).expect(200);
    const { data, errors } = res.body;
    expect(errors).toEqual(undefined);
    const payload: tokens.InvitationTokenPayload = await tokens.parse(data.createInvitation.token);
    let savedInvitation = await findInvitationByID(payload.invitationID, client);
    if (savedInvitation === undefined) {
      expect(savedInvitation).not.toEqual(undefined);
      return
    }
    expect(savedInvitation.resourceID).toEqual(tags[0][0].id);
    expect(savedInvitation.resourceType).toEqual(PolicyResourceType.Tag);
    expect(savedInvitation.expiresAt).toEqual(null);

    const invitationQuery: InvitationQuery = {
      resource: {
        resourceType: savedInvitation.resourceType,
        resourceID: savedInvitation.resourceID,
      }
    };
    res = await graphql(token).send({
      query: `
        query Invitations($query: InvitationQuery!) {
          invitations(query: $query) {
            id resourceType resourceID
          }
        }
      `,
      variables: {
        query: invitationQuery,
      },
    }).expect(200);
    const invitations: Invitation[] = res.body.data.invitations;
    expect(invitations.length).toEqual(1);
    expect(invitations[0].resourceType).toEqual(savedInvitation.resourceType);
    expect(invitations[0].resourceID).toEqual(savedInvitation.resourceID);

    res = await graphql(token1).send({
      query: `
        mutation AcceptInvitation($token: String!) {
          acceptInvitation(token: $token) {
            empty
          }
        }
      `,
      variables: {
        token: data.createInvitation.token,
      },
    }).expect(200);
    expect(res.body.errors).toEqual(undefined);

    const policyQuery: PolicyQuery = {
      resource: {
        resourceType: savedInvitation.resourceType,
        resourceID: savedInvitation.resourceID,
      }
    };
    const policies = await listPolicies(policyQuery, client);
    expect(policies.length).toEqual(1);
    expect(policies[0].resourceType).toEqual(savedInvitation.resourceType);
    expect(policies[0].resourceID).toEqual(savedInvitation.resourceID);
    expect(policies[0].invitationID).toEqual(savedInvitation.id);
    expect(policies[0].uid).toEqual('uid1');

    res = await graphql(token).send({
      query: `
        mutation DeleteInvitation($invitationID: Int!) {
          deleteInvitation(invitationID: $invitationID) {
            empty
          }
        }
      `,
      variables: {
        invitationID: savedInvitation.id,
      },
    }).expect(200);
    savedInvitation = await findInvitationByID(savedInvitation.id, client);
    expect(savedInvitation).toEqual(undefined);
  });

  test('create invitation with expiration', async () => {
    const expiresAt = moment().add(30, 'days');
    const invitation: NewInvitation = {
      resourceType: PolicyResourceType.Tag,
      resourceID: tags[0][0].id,
      action: PolicyAction.Wildcard,
      expiresAt: expiresAt.format(),
    };
    const tokenExpirationHours = 3;
    let res = await graphql(token).send({
      query: `
        mutation CreateInvitation($invitation: NewInvitation!, $tokenExpirationHours: Int) {
          createInvitation(invitation: $invitation, tokenExpirationHours: $tokenExpirationHours) {
            token
          }
        }
      `,
      variables: {
        invitation, tokenExpirationHours,
      },
    }).expect(200);
    const { data, errors } = res.body;
    expect(errors).toEqual(undefined);
    const payload: tokens.InvitationTokenPayload = await tokens.parse(data.createInvitation.token);
    expect(((payload.exp || 0) - moment().add(tokenExpirationHours, 'hours').unix()) / 10).toBeCloseTo(0, 1);

    let savedInvitation = await findInvitationByID(payload.invitationID, client);
    if (savedInvitation === undefined) {
      expect(savedInvitation).not.toEqual(undefined);
      return
    }
    expect(savedInvitation.resourceID).toEqual(tags[0][0].id);
    expect(savedInvitation.resourceType).toEqual(PolicyResourceType.Tag);
    expect(moment(savedInvitation.expiresAt).utc().format()).toEqual(expiresAt.utc().format());

    res = await graphql(token1).send({
      query: `
        mutation AcceptInvitation($token: String!) {
          acceptInvitation(token: $token) {
            empty
          }
        }
      `,
      variables: {
        token: data.createInvitation.token,
      },
    }).expect(200);
    const policyQuery: PolicyQuery = {
      resource: {
        resourceType: savedInvitation.resourceType,
        resourceID: savedInvitation.resourceID,
      }
    };
    expect(res.body.errors).toEqual(undefined);

    const policies = await listPolicies(policyQuery, client);
    expect(policies.length).toEqual(1);
    expect(policies[0].resourceType).toEqual(savedInvitation.resourceType);
    expect(policies[0].resourceID).toEqual(savedInvitation.resourceID);
    expect(policies[0].invitationID).toEqual(savedInvitation.id);
    expect(policies[0].uid).toEqual('uid1');
    expect(moment(policies[0].expiresAt).utc().format()).toEqual(expiresAt.utc().format());
  });
});
