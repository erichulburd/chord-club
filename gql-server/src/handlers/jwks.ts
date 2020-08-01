import { RequestHandler, Request, Response, NextFunction } from 'express';
import { jwks } from '../util/tokens';

export const jwksJSON: RequestHandler<{}> = async (
  _req: Request, res: Response, next: NextFunction,
) => {
  res.status(200).json(jwks);
};
