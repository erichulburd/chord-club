import { RequestHandler, Request, Response, NextFunction } from 'express';
import { RequestWithMeta } from './metaMiddleware';
import { ErrorType } from '../types';


export const health: RequestHandler<{}> = async (
  req: Request, res: Response, next: NextFunction,
) => {
  const {
    uid,
    dbClientManager,
    start,
    logger,
  } = (req as RequestWithMeta)._meta;
  try {
    await dbClientManager.pool.query('SELECT 1');
    logger.child({
      success: true,
      ms: Date.now() - start,
    }).info('success');
    res.json({ uid });
  } catch (err) {
    logger.child({
      success: false,
      ms: Date.now() - start,
      errorCode: ErrorType.Unhandled,
    }).error('err');
    next(err);
  }
};
