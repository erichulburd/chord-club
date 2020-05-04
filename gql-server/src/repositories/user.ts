import { UserQuery, UserQueryOrder, User, UserNew, UserUpdate } from '../types';
import { PoolClient } from 'pg';
import { makeDBFields, makeSelectFields, makeDBDataToObject } from './db';

const attrs = [
  'uid', 'createdAt', 'username',
];
const dbFields = makeDBFields(attrs);
const selectFields = makeSelectFields(dbFields, 'u');
const dbDataToUser = makeDBDataToObject(attrs, 'User');

interface UserSQLQuery {
  orderBy: string;
  direction: 'ASC' | 'DESC';
  limit: number;
}

export const findUserByUID = async (uid: string, client: PoolClient) => {
  const result = await client.query(`
    SELECT
      ${selectFields}
      FROM userr u
      WHERE u.uid = $1
  `, [uid]);
  if (result.rows.length < 1) {
    return undefined;
  }
  return dbDataToUser(result.rows[0]) as User;
};

export const findUsersByUID = async (uids: readonly string[], client: PoolClient) => {
  const result = await client.query(`
    SELECT
      ${selectFields}
      FROM userr u
      WHERE u.uid = ANY ($1)
  `, [uids]);
  return result.rows.map(dbDataToUser) as User[];
};

export const findUserByUsername = async (username: string, client: PoolClient) => {
  const result = await client.query(`
    SELECT
      ${selectFields}
      FROM userr u
      WHERE LOWER(u.username) = $1
  `, [username.toLowerCase()]);
  if (result.rows.length < 1) {
    return undefined;
  }
  return dbDataToUser(result.rows[0]) as User;
};


const findUsers = async (query: UserSQLQuery, client: PoolClient) => {
  const result = await client.query(`
  SELECT
    ${selectFields}
  FROM userr u
  ORDER BY $1, u.uid ${query.direction}
  LIMIT $2
  `, [query.orderBy, query.limit]);
  return result.rows as User[];
};

const findUsersAfter = async (
  after: string, query: UserSQLQuery, client: PoolClient) => {

  const result = await client.query(`
  WITH ranks AS (
    SELECT
      ${selectFields},
      RANK() OVER (
        ORDER BY $1, u.uid ${query.direction}
      ) rank_number
    FROM userr u
  )
  SELECT
    uid, username, created_at
  FROM ranks
  WHERE rank_number > (SELECT rank_number FROM ranks WHERE uid = $2)
  ORDER BY $1, uid ${query.direction}
  LIMIT $3
  `, [query.orderBy, after, query.limit]);
  return result.rows.map(dbDataToUser) as User[];
};

export const insertUserNew = async (
  newUser: UserNew, uid: string, client: PoolClient) => {
    const result = await client.query(`
      INSERT INTO
        userr (uid, username)
        VALUES ($1, $2)
        RETURNING ${dbFields.join(', ')}
    `, [uid, newUser.username]);
    return dbDataToUser(result.rows[0]) as User;
};

export const updateUser = async (
  update: UserUpdate, uid: string, client: PoolClient) => {
    const result = await client.query(`
      UPDATE
        userr
        SET username = $1
        WHERE uid = $2
        RETURNING ${dbFields.join(', ')}
    `, [update.username, uid]);
    return dbDataToUser(result.rows[0]) as User;
};

export const deleteUser = async (
  uid: string, client: PoolClient) => {
    await client.query(`
    DELETE FROM userr WHERE uid = $1
  `, [uid]);
};

export const executeUserQuery = async (rawQuery: UserQuery, client: PoolClient) => {
  if (rawQuery.uid) {
    const user = await findUserByUID(rawQuery.uid, client);
    if (!user) return [];
    return [user];
  }
  if (rawQuery.username) {
    const user = await findUserByUsername(rawQuery.username, client);
    if (!user) return [];
    return [user];
  }

  const order = (rawQuery.order || UserQueryOrder.CreatedBy).toLowerCase();
  const direction = (rawQuery.asc === undefined ? false : rawQuery.asc) ? 'ASC' : 'DESC';
  const orderBy = `${order} ${direction}`;
  const limit = Math.min(100, rawQuery.limit || 50);
  const query: UserSQLQuery = { orderBy, direction, limit };
  if (rawQuery.after) {
    return findUsersAfter(rawQuery.after, query, client);
  }
  return findUsers(query, client);
};
