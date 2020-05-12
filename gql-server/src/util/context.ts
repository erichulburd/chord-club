import { ExpressContext } from 'apollo-server-express/dist/ApolloServer';
import { Loaders } from '../repositories/loaders';
import { PoolClient, Pool } from 'pg';
import { DBClientManager } from '../repositories/db';
import pino from 'pino';
import { RequestWithMeta } from '../handlers/metaMiddleware';

export interface Context {
  uid: string;
  requestID: string;
  loaders: Loaders;
  db: Pool | PoolClient;
  dbClientManager: DBClientManager;
  logger: pino.Logger;
}

export const makeRequestContext = () => async (ctx: ExpressContext): Promise<Context> => {
  const req = ctx.req as RequestWithMeta;
  const { uid, dbClientManager, logger, requestID, loaders } = req._meta;
  try {
    return {
      uid: uid || '',
      dbClientManager,
      db: dbClientManager.queryable(),
      requestID,
      logger,
      loaders,
    };
  } catch (err) {
    logger.error(err);
    throw err;
  }
};
