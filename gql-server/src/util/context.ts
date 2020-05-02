import { ExpressContext } from 'apollo-server-express/dist/ApolloServer';
import { parseAuthorization, getBearerToken, AccessTokenClaims } from './auth';
import { v4 as uuidv4 } from 'uuid';
import { makeLoaders, Loaders } from '../repositories/loaders';
import { PoolClient } from 'pg';
import { DBClientManager } from '../repositories/db';
import { GetPublicKeyOrSecret } from 'jsonwebtoken';
import pino from 'pino';
import baseLogger from './logger';
import { RequestWithMeta } from './app';

export interface Context {
  uid: string;
  requestID: string;
  loaders: Loaders;
  db: PoolClient;
  dbClientManager: DBClientManager;
  logger: pino.Logger;
}

const getRequestID = (ctx: ExpressContext) => {
  const { headers } = ctx.req;
  let requestID = headers['X-REQUEST-ID'] instanceof Array ? headers['X-REQUEST-ID'][0] : headers['X-REQUEST-ID'];
  if (!requestID) {
    return uuidv4();
  }
  return requestID;
}

export const makeRequestContext = (dbClientManager: DBClientManager, getKey: GetPublicKeyOrSecret) =>
async (ctx: ExpressContext): Promise<Context> => {
  const requestID = getRequestID(ctx);
  let logger = baseLogger.child({
    requestID,
  });
  try {
    const token = getBearerToken(ctx.req.headers.authorization || '') || undefined;
    let claims: AccessTokenClaims | undefined;
    if (token) {
      claims = await parseAuthorization(token, getKey);
    }
    const uid = claims?.sub;
    logger = logger.child({
      uid,
    });
    const req = ctx.req as RequestWithMeta;
    const db = req._meta.db;
    const loaders = makeLoaders(db, uid);
    return {
      uid: uid || '',
      dbClientManager,
      db,
      requestID,
      logger,
      loaders,
    };
  } catch (err) {
    logger.error(err);
    throw err;
  }
};
