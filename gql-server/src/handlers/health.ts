import { RequestHandler, Request, Response, NextFunction } from 'express';
import { RequestWithMeta } from './metaMiddleware';
import { ErrorType } from '../types';


export const health: RequestHandler<{}> = async (
  req: Request, res: Response, next: NextFunction,
) => {
  const {
    uid,
    dbClientManager,
    logger, start,
  } = (req as RequestWithMeta)._meta;
  try {
    await dbClientManager.pool.query('SELECT 1');
    res.json({ uid });
    logger.child({
      success: true, statusCode: 200,
      ms: Date.now() - start,
    }).info('success');
  } catch (err) {
    logger.child({
      success: false, statusCode: 500,
      ms: Date.now() - start,
      errorCode: ErrorType.Unhandled,
    }).error(err);
    next(err);
  }
};
