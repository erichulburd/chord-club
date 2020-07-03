import { prepareDBInsert, Queryable, NULL } from './db';
import { Invitation, PolicyAction, NewPolicy, Policy, PolicyQuery } from '../types';
import { makeDBFields, makeSelectFields, makeDBDataToObject } from './db';
import moment from 'moment'
import { pick } from 'lodash';

const attrs = [
  'id', 'resourceType', 'resourceID', 'uid', 'action', 'invitationID',
  'expirationTime', 'createdTime', 'deletedTime', 'deleted'
];
const dbFields = makeDBFields(attrs);
const selectFields = makeSelectFields(dbFields, 'p');
const _dbDataToPolicy = makeDBDataToObject<Policy>(attrs, 'Policy');
const dbDataToPolicy = (row: {[key: string]: any}) => {
  const policy = _dbDataToPolicy(row);
  policy.action = dbActionToGQL(row.action);
  policy.expirationTime = policy.expirationTime && moment(policy.expirationTime).format();
  policy.createdTime = moment(policy.createdTime).utc().format();
  return policy;
};

export const policyActionMap = {
  [PolicyAction.Wildcard]: 1,
  [PolicyAction.Write]: 2,
  [PolicyAction.Read]: 3,
};
export const dbActionToGQL = (val: number) => {
  switch(val) {
    case 1:
      return PolicyAction.Wildcard;
    case 2:
      return PolicyAction.Write;
    default:
      return PolicyAction.Read;
  }
};

const policyDynamicValues = {
  resourceType: (newPolicy: NewPolicy) => `'${newPolicy.resourceType.toUpperCase()}'`,
  action: (newPolicy: NewPolicy) => `'${policyActionMap[newPolicy.action].toString()}'`,
  expirationTime: (newPolicy: NewPolicy) => {
    if (!newPolicy.expirationTime) {
      return NULL;
    }
    const m = moment(newPolicy.expirationTime);
    if (m.isValid()) {
      return `'${m.format()}'`;
    }
    return NULL;
  }
};

const insertWhitelist = ['resource_id', 'invitation_id', 'uid'];

export const insertPolicies = async (
  newPolicies: (NewPolicy)[], queryable: Queryable) => {
  const { columns, prep, values } = prepareDBInsert<NewPolicy>(
    newPolicies, insertWhitelist, policyDynamicValues);
  const res = await queryable.query(`
    INSERT INTO policy (${columns})
      VALUES ${prep} RETURNING ${dbFields.join(', ')}
  `, values);
  return res.rows.map(dbDataToPolicy);
};

export const deletePolicy = async (
  policyID: number, queryable: Queryable) => {
  await queryable.query(`
    UPDATE policy_data SET deleted=TRUE, deleted_time=NOW() WHERE id = $1
  `, [policyID]);
};

export const makeNewPolicyFromInvitation = (uid: string, invitation: Invitation): Partial<NewPolicy & { invitationID: number | undefined }> => {
  return {
    ...(pick(invitation, ['resourceType', 'resourceID', 'action', 'expirationTime'])),
    uid,
    invitationID: invitation.id,
  };
};

export const findPolicyByID = async (
  policyID: number, queryable: Queryable) => {
  const result = await queryable.query(`
    SELECT ${selectFields} FROM policy p
      WHERE id = $1
  `, [policyID]);
  if (result.rows.length < 1) {
    return undefined;
  }
  return dbDataToPolicy(result.rows[0]) as Policy;
};

export const listPolicies = async (
  query: PolicyQuery, queryable: Queryable) => {
  const result = await queryable.query(`
    SELECT ${selectFields} FROM policy p
      WHERE resource_type=$1 AND resource_id=$2
  `, [query.resource.resourceType.toUpperCase(), query.resource.resourceID]);
  return result.rows.map(dbDataToPolicy);
};
