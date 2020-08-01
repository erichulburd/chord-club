import { prepareDBInsert, Queryable, NULL } from './db';
import { NewInvitation, Invitation, InvitationQuery } from '../types';
import { makeDBFields, makeSelectFields, makeDBDataToObject } from './db';
import { policyActionMap, dbActionToGQL } from './policy';
import moment from 'moment'

const attrs = [
  'id', 'resourceType', 'resourceID', 'action',
  'expiresAt', 'createdAt', 'createdBy', 'deletedAt', 'deleted'
];
const dbFields = makeDBFields(attrs);
const selectFields = makeSelectFields(dbFields, 'i');
const _dbDataToInvitation = makeDBDataToObject<Invitation>(attrs, 'Invitation');
const dbDataToInvitation = (row: {[key: string]: any}) => {
  const invitation = _dbDataToInvitation(row);
  invitation.action = dbActionToGQL(row.action);
  invitation.expiresAt = invitation.expiresAt && moment(invitation.expiresAt).utc().format();
  invitation.createdAt = moment(invitation.createdAt).utc().format();
  return invitation;
};

const invitationDynamicValues = (createdby: string) => ({
  resourceType: (newInvitation: NewInvitation) => `'${newInvitation.resourceType.toUpperCase()}'`,
  action: (newInvitation: NewInvitation) => `'${policyActionMap[newInvitation.action].toString()}'`,
  expiresAt: (newInvitation: NewInvitation) => {
    if (!newInvitation.expiresAt) {
      return NULL;
    }
    const m = moment(newInvitation.expiresAt);
    if (m.isValid()) {
      return `'${m.format()}'`;
    }
    return NULL;
  },
  createdBy: `'${createdby}'`,
});

const insertWhitelist = ['resource_id'];

export const insertInvitations = async (
  newInvitations: NewInvitation[], createdby: string, queryable: Queryable) => {
  const { columns, prep, values } = prepareDBInsert<NewInvitation>(
    newInvitations, insertWhitelist, invitationDynamicValues(createdby));
  const res = await queryable.query(`
    INSERT INTO invitation (${columns})
      VALUES ${prep} RETURNING ${dbFields.join(', ')}
  `, values);
  return res.rows.map(dbDataToInvitation);
};

export const deleteInvitation = async (
  invitationID: number, queryable: Queryable) => {
  await queryable.query(`
    UPDATE invitation_data SET deleted=TRUE, deleted_at=NOW() WHERE id = $1
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
