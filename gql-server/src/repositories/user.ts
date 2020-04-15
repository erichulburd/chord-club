import { UserQuery, UserQueryOrder, User, UserNew, UserUpdate } from '../types';
import { PoolClient } from 'pg';
import { snakeCase } from 'lodash';

const selectFields = [
  'uid', 'createdAt', 'displayName',
].map((field) => `${snakeCase(field)} AS ${field}`).join(', ');

export const executeUserQuery = async (query: UserQuery, client: PoolClient) => {
  if (query.userUID) {
    return findUserByUID(query.userUID, client);
  }
  if (query.username) {
    return findUserByUsername(query.username, client);
  }

  const order = (query.order || UserQueryOrder.CreatedBy).toLowerCase();
  const direction = (query.asc === undefined ? false : query.asc) ? 'ASC' : 'DESC';
  const orderBy = `${order} ${direction}`;
  const limit = Math.min(100, query.limit || 50);
  if (query.after) {
    return findUsersAfter(query.after, orderBy, limit, client);
  }
  return findUsers(orderBy, limit, client);
};

const findUserByUID = async (uid: string, client: PoolClient) => {
  const result = await client.query(`
    SELECT
      ${selectFields}
      FROM userr
      WHERE uid = $1
  `, [uid]);
  if (result.rows.length < 1) {
    return undefined;
  }
  return result.rows as User[];
};

const findUserByUsername = async (username: string, client: PoolClient) => {
  const result = await client.query(`
    SELECT
      ${selectFields}
      FROM userr
      WHERE username = $1
  `, [username]);
  if (result.rows.length < 1) {
    return undefined;
  }
  return result.rows as User[];
};


const findUsers = async (orderBy: string, limit: number, client: PoolClient) => {
  const result = await client.query(`
  SELECT
    ${selectFields}
  FROM userr
  ORDER BY $1, uid ASC
  LIMIT $2
  `, [orderBy, limit]);
  return result.rows as User[];
};

const findUsersAfter = async (
  after: string, orderBy: string,
  limit: number, client: PoolClient) => {

  const result = await client.query(`
  WITH ranks AS (
    SELECT
      ${selectFields},
      RANK() OVER (
        $1, uid ASC
      ) rank_number
    FROM userr
  )
  SELECT
    uid, username, created_at
  FROM ranks
  WHERE rank_number > (SELECT rank_number FROM ranks WHERE uid = $2)
  ORDER BY $1, uid ASC
  LIMIT $3
  `, [orderBy, after, limit]);
  return result.rows as User[];
};

export const createUser = async (
  newUser: UserNew, userUID: string, client: PoolClient) => {
    const result = await client.query(`
      INSERT INTO
        userr (uid, username)
        VALUES ($1, $2)
        RETURNING ${selectFields}
    `, [userUID, newUser.username]);
    return result.rows[0] as User;
};

export const updateUser = async (
  update: UserUpdate, userUID: string, client: PoolClient) => {
    const result = await client.query(`
      UPDATE
        userr
        SET username = $1
        WHERE uid = $2
        RETURNING ${selectFields}
    `, [update.username, userUID]);
    return result.rows[0] as User;
};

export const deleteUser = async (
  uid: string, client: PoolClient) => {
    await client.query(`
    DELETE FROM userr WHERE uid = $1
  `, [uid]);
};
