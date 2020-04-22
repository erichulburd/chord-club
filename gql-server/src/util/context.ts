import { ExpressContext } from 'apollo-server-express/dist/ApolloServer';
import { parseAuthorization, getBearerToken, AccessTokenClaims } from './auth';
import { v4 as uuidv4 } from 'uuid';
import { makeLoaders, Loaders } from '../repositories/loaders';
import { PoolClient } from 'pg';
import { DBClientManager, DBTxManager } from '../repositories/db';
import { GetPublicKeyOrSecret } from 'jsonwebtoken';
import pino from 'pino';
import baseLogger from './logger';

export interface Context {
  uid: string;
  requestID: string;
  loaders: Loaders;
  db: PoolClient;
  txManager: DBTxManager;
  dbClientManager: DBClientManager;
  logger: pino.Logger;
}

export const makeRequestContext = (dbClientManager: DBClientManager, getKey: GetPublicKeyOrSecret) =>
async (ctx: ExpressContext): Promise<Context> => {
  const requestID = uuidv4();
  let logger = baseLogger.child({
    requestID,
  });
  const token = getBearerToken(ctx.req.headers.authorization || '');
  let claims: AccessTokenClaims | undefined = undefined;
  try {
    claims = (token && await parseAuthorization(token, getKey)) || undefined;
  } catch (err) {
    logger.error(err);
  }
  const uid = claims && claims.sub;
  logger = logger.child({
    uid,
  });
  const [db, txManager] = await dbClientManager.newConnection();
  const loaders = makeLoaders(db, uid);
  return {
    uid: uid || '',
    dbClientManager,
    db,
    txManager,
    requestID,
    logger,
    loaders,
  };
};
