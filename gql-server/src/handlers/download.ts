import { RequestHandler, Request, Response, NextFunction } from 'express';
import { RequestWithMeta } from './metaMiddleware';
import { ErrorType } from '../types';
import { createReadStream, GC_STORAGE_URL_BASE } from '../util/gcStorage';
import { findChartByID } from '../repositories/chart';

export const download: RequestHandler<{}> = async (
  req: Request, res: Response,
) => {
  const {
    uid,
    dbClientManager,
    logger, start,
  } = (req as RequestWithMeta)._meta;
  if (!['audio', 'image'].includes(req.params.media)) {
    res.status(400);
    logger.child({
      success: false, statusCode: res.statusCode,
      ms: Date.now() - start,
      errorCode: 'INVALID_DOWNLOAD_MEDIA_TYPE',
    }).error('invalid media');
    res.end();
    return
  }
  const chartID = parseInt(req.params.chartID, 10);
  if (isNaN(chartID)) {
    res.status(400);
    logger.child({
      success: false, statusCode: res.statusCode,
      ms: Date.now() - start,
      errorCode: ErrorType.ChartNotFound,
    }).error('invalid chart id');
    res.end();
    return
  }

  if (!uid) {
    res.status(401);
    logger.child({
      success: false, statusCode: res.statusCode,
      ms: Date.now() - start,
      errorCode: ErrorType.Unauthenticated,
    }).error('unauthorized');
    res.end();
    return
  }
  const db = dbClientManager.queryable();
  const chart = await findChartByID(chartID, uid, db);
  if (chart === undefined) {
    res.status(404);
    logger.child({
      success: false, statusCode: res.statusCode,
      ms: Date.now() - start,
      errorCode: ErrorType.ChartNotFound,
    }).error('not found');
    res.end();
    return
  }

  const fileName = chart.audioURL.replace(GC_STORAGE_URL_BASE, '');
  const stream = createReadStream(fileName, {
    decompress: false
  });

  stream
    .on('response', (r) => {
      res.setHeader('Cache-Control', r.headers['cache-control']);
      res.setHeader('Content-Disposition', r.headers['content-disposition']);
      res.setHeader('Content-Type', r.headers['content-type']);
      res.setHeader('Content-Length', r.headers['content-length']);
    })
    .on('end', () => {
      res.status(200);
      logger.child({
        success: true, statusCode: 200,
        ms: Date.now() - start,
        errorCode: ErrorType.Unhandled,
      }).info('success');
      res.end();
    })
    .on('error', (err) => {
      res.status(500);
      logger.child({
        success: false, statusCode: 200,
        ms: Date.now() - start,
        errorCode: ErrorType.Unhandled,
      }).error(err);
      res.end();
    });
  stream.pipe(res);
};
