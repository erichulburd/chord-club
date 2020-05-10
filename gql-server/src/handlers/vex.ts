import { JSDOM } from 'jsdom';
import { RequestHandler } from 'express';
import { Flow } from 'vexflow';
import { makeSVG } from '../util/vex';
import { RequestWithMeta } from './metaMiddleware';
import { ErrorType } from '../types';


export const vexHandler: RequestHandler<{}> = async (req, res, next) => {
  const {
    logger, start,
  } = (req as RequestWithMeta)._meta;
  try {
    const svg = await makeSVG(req.body.score)
    res.status(200);
    res.setHeader('Content-Type', 'image/svg+xml');
    res.send(svg);
    res.end();
    logger.child({
      success: true,
      ms: Date.now() - start,
    }).info('success');
  } catch (err) {
    logger.child({
      success: false,
      ms: Date.now() - start,
      errorCode: ErrorType.Unhandled,
    }).error(err);
    next(err)
  }
}
