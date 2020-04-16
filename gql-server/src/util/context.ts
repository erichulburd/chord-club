import { ExpressContext } from 'apollo-server-express/dist/ApolloServer';
import { parseAuthorization, getBearerToken } from './auth';
import { v4 as uuidv4 } from 'uuid';
import { makeLoaders, Loaders } from '../repositories/loaders';
import { PoolClient } from 'pg';
import pino from 'pino';
import { DBClientManager, DBTxManager } from '../repositories/db';

const logger = pino();


export interface Context {
  uid: string;
  requestID: string;
  loaders: Loaders;
  db: PoolClient;
  txManager: DBTxManager;
  dbClientManager: DBClientManager;
  logger: pino.Logger;
}

export const makeRequestContext = (dbClientManager: DBClientManager) => async (ctx: ExpressContext): Promise<Context> => {
  const token = getBearerToken(ctx.req.headers.authorization || '');
  const claims = (token && await parseAuthorization(token)) || undefined;
  const uid = claims && claims.uid;
  const [db, txManager] = await dbClientManager.newConnection();
  const requestID = uuidv4();
  return {
    uid: uid || '',
    dbClientManager,
    db,
    txManager,
    requestID,
    logger: logger.child({
      requestID,
      uid,
    }),
    loaders: makeLoaders(db, uid),
  };
};
