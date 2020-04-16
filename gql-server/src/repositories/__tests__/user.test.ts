import { makeDBPool, TestDBClientManager, DBTxManager } from '../db';
import { PoolClient } from 'pg';
import { UserUpdate, User } from '../../types';
import { makeUserNew } from '../../../tests/factories';
import { insertUserNew, updateUser, findUserByUID, deleteUser, findUserByUsername, executeUserQuery } from '../user';


describe('user repository', () => {
  const pool = makeDBPool();
  const dbClientManager = new TestDBClientManager(pool);
  afterAll(async () => {
    await pool.end();
  });

  describe('basic tag operations', () => {
    let client: PoolClient;
    let txManager: DBTxManager;

    beforeEach(async () => {
      const conn = await dbClientManager.newConnection();
      client = conn[0];
      txManager = conn[1];
    });

    afterEach(async () => {
      await txManager.rollbackTx(0);
      client.release();
    });

    test('create edit and update user', async () => {
      const userNew = makeUserNew({ username: 'username' });
      let user: User | undefined = await insertUserNew(userNew, 'uid', client);
      expect(user.uid).toEqual('uid');
      expect(user.username).toEqual(userNew.username);
      const update: UserUpdate = { username: 'blah' };
      await updateUser(update, 'uid', client);
      user = await findUserByUID(user.uid, client);
      expect(user?.username).toEqual('blah');
      user = await findUserByUsername(userNew.username, client);
      expect(user).toEqual(undefined);
      await deleteUser('uid', client);
      user = await findUserByUID('uid', client);
      expect(user).toEqual(undefined);
    });

  });

  describe('executeUserQuery', () => {
    let client: PoolClient;
    let txManager: DBTxManager;

    beforeAll(async () => {
      const conn = await dbClientManager.newConnection();
      client = conn[0];
      txManager = conn[1];

      await insertUserNew(makeUserNew({ username: 'user1' }), 'uid1', client);
      await insertUserNew(makeUserNew({ username: 'user2' }), 'uid2', client);
      await insertUserNew(makeUserNew({ username: 'user3' }), 'uid3', client);
      await insertUserNew(makeUserNew({ username: 'user4' }), 'uid4', client);
    });

    afterAll(async () => {
      await txManager.rollbackTx(0);
      client.release();
    });

    test('findUserByUID', async () => {
      const users = await executeUserQuery({ uid: 'uid1' }, client);
      expect(users.length).toEqual(1);
      expect(users[0].uid).toEqual('uid1');
      expect(users[0].username).toEqual('user1');
    });

    test('findUserByUID doesnt exist', async () => {
      const users = await executeUserQuery({ uid: 'uid999' }, client);
      expect(users.length).toEqual(0);
    });

    test('findUserByUsername', async () => {
      const users = await executeUserQuery({ username: 'user2' }, client);
      expect(users.length).toEqual(1);
      expect(users[0].uid).toEqual('uid2');
      expect(users[0].username).toEqual('user2');
    });

    test('findUserByUsername doesnt exist', async () => {
      const users = await executeUserQuery({ username: 'user999' }, client);
      expect(users.length).toEqual(0);
    });

    test('findUsers', async () => {
      const users = await executeUserQuery({}, client);
      expect(users.length).toEqual(4);
    });

    test('findUsers limit', async () => {
      const users = await executeUserQuery({ limit: 2 }, client);
      expect(users.length).toEqual(2);
    });

    test('findUsers desc', async () => {
      const users1 = await executeUserQuery({}, client);
      expect(users1.length).toEqual(4);
      const users2 = await executeUserQuery({ asc: true }, client);
      expect(users2.length).toEqual(4);
      users2.reverse();
      expect(users1.every((u, i) => u.uid === users2[i].uid));
    });

    test('findUsersAfter', async () => {
      const users1 = await executeUserQuery({}, client);
      expect(users1.length).toEqual(4);
      const users2 = await executeUserQuery({ after: users1[2].uid }, client);
      expect(users2.length).toEqual(1);
      expect(users2[0].uid).toEqual(users1[3].uid);
    });
  });
});
