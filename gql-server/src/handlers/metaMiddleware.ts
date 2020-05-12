import { RequestHandler, Request, Response, NextFunction } from 'express';
import { v4 } from 'uuid';
import pino from 'pino';
import baseLogger from '../util/logger';
import { getBearerToken, AccessTokenClaims, parseAuthorization } from '../util/auth';
import { DBClientManager } from '../repositories/db';
import { GetPublicKeyOrSecret } from 'jsonwebtoken';
import { makeLoaders, Loaders } from '../repositories/loaders';
import { coerceUnhandledError } from '../util/errors';

interface RequestMetadata {
  requestID: string;
  uid: string | undefined;
  claims: AccessTokenClaims | undefined;
  logger: pino.Logger;
  authError: any | undefined;
  dbClientManager: DBClientManager;
  loaders: Loaders;
  start: number;
}

const getRequestID = (req: Request) => {
  const { headers } = req;
  const requestID = headers['X-REQUEST-ID'] instanceof Array ? headers['X-REQUEST-ID'][0] : headers['X-REQUEST-ID'];
  if (!requestID) {
    return v4();
  }
  return requestID;
};


export interface RequestWithMeta extends Request {
  _meta: RequestMetadata;
}

type MetaMiddleware = (dbClientManager: DBClientManager, getKey: GetPublicKeyOrSecret) => RequestHandler<{}>;

export const makeMetaMiddleware: MetaMiddleware = (dbClientManager: DBClientManager, getKey: GetPublicKeyOrSecret) =>
async (
  req: Request, _res: Response, next: NextFunction,
) => {
  const requestID = getRequestID(req);
  const start = Date.now();
  let logger = baseLogger.child({
    requestID,
    start,
    path: req.path,
  });
  const token = getBearerToken(req.headers.authorization || '') || undefined;
  let claims: AccessTokenClaims | undefined;
  let authError: any | undefined;
  if (token) {
    try {
      claims = await parseAuthorization(token, getKey);
    } catch (err) {
      logger.error(err);
      authError = err;
    }
  }
  const uid = claims?.sub;
  logger = baseLogger.child({
    uid,
  });
  const loaders = makeLoaders(dbClientManager.queryable(), uid);
  (req as RequestWithMeta)._meta = {
    uid, authError, requestID, claims, logger,
    dbClientManager, loaders, start,
  };
  try {
    next();
  } catch (err) {
    const apolloError = coerceUnhandledError(err);
    logger = logger.child({
      ms: Date.now() - start,
      success: false,
      errorCode: apolloError.code,
    });
    logger.error(err);
    next(apolloError);
  }
};
