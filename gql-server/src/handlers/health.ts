import { RequestHandler, Request, Response, NextFunction } from 'express';
import { RequestWithMeta } from './metaMiddleware';


export const health: RequestHandler<{}> = async (
  req: Request, res: Response, next: NextFunction,
) => {
  const {
    uid,
    dbClientManager,
  } = (req as RequestWithMeta)._meta;
  try {
    await dbClientManager.pool.query('SELECT 1');
    res.json({ uid });
  } catch (err) {
    next(err);
  }
};
