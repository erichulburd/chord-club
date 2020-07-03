import { prepareDBInsert, Queryable, NULL } from './db';
import { NewInvitation, Invitation, InvitationQuery } from '../types';
import { makeDBFields, makeSelectFields, makeDBDataToObject } from './db';
import { policyActionMap, dbActionToGQL } from './policy';
import moment from 'moment'

const attrs = [
  'id', 'resourceType', 'resourceID', 'action',
  'expirationTime', 'createdAt', 'deletedTime', 'deleted'
];
const dbFields = makeDBFields(attrs);
const selectFields = makeSelectFields(dbFields, 'i');
const _dbDataToInvitation = makeDBDataToObject<Invitation>(attrs, 'Invitation');
const dbDataToInvitation = (row: {[key: string]: any}) => {
  const invitation = _dbDataToInvitation(row);
  invitation.action = dbActionToGQL(row.action);
  invitation.expirationTime = invitation.expirationTime && moment(invitation.expirationTime).utc().format();
  invitation.createdAt = moment(invitation.createdAt).format();
  return invitation;
};

const invitationDynamicValues = {
  resourceType: (newInvitation: NewInvitation) => `'${newInvitation.resourceType.toUpperCase()}'`,
  action: (newInvitation: NewInvitation) => `'${policyActionMap[newInvitation.action].toString()}'`,
  expirationTime: (newInvitation: NewInvitation) => {
    if (!newInvitation.expirationTime) {
      return NULL;
    }
    const m = moment(newInvitation.expirationTime);
    if (m.isValid()) {
      return `'${m.format()}'`;
    }
    return NULL;
  }
};

const insertWhitelist = ['resource_id'];

export const insertInvitations = async (
  newInvitations: NewInvitation[], queryable: Queryable) => {
  const { columns, prep, values } = prepareDBInsert<NewInvitation>(
    newInvitations, insertWhitelist, invitationDynamicValues);
  const res = await queryable.query(`
    INSERT INTO invitation (${columns})
      VALUES ${prep} RETURNING ${dbFields.join(', ')}
  `, values);
  return res.rows.map(dbDataToInvitation);
};

export const deleteInvitation = async (
  invitationID: number, queryable: Queryable) => {
  await queryable.query(`
    UPDATE invitation_data SET deleted=TRUE, deleted_time=NOW() WHERE id = $1
  `, [invitationID]);
};

export const findInvitationByID = async (
  invitationID: number, queryable: Queryable) => {
  const result = await queryable.query(`
    SELECT ${selectFields} FROM invitation i
      WHERE id = $1
  `, [invitationID]);
  if (result.rows.length < 1) {
    return undefined;
  }
  return dbDataToInvitation(result.rows[0]) as Invitation;
};

export const listInvitations = async (
  query: InvitationQuery, queryable: Queryable) => {
  const result = await queryable.query(`
    SELECT ${selectFields} FROM invitation i
      WHERE resource_type=$1 AND resource_id=$2
  `, [query.resource.resourceType.toUpperCase(), query.resource.resourceID]);
  return result.rows.map(dbDataToInvitation);
};
