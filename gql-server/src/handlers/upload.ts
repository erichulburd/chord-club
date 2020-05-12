import { RequestHandler, Request, Response, NextFunction } from 'express';
import { RequestWithMeta } from './metaMiddleware';
import { ErrorType } from '../types';
import { IncomingForm } from 'formidable';
import { MAX_FILE_SIZE_MB, upload } from '../util/gcStorage';


export const uploadHandler: RequestHandler<{}> = async (
  req: Request, res: Response, next: NextFunction,
) => {
  const {
    uid,
    start,
    logger,
  } = (req as RequestWithMeta)._meta;

  if (!uid) {
    res.status(401);
    logger.child({
      success: false, statusCode: 401,
      ms: Date.now() - start,
      errorCode: ErrorType.Unauthenticated,
    }).error('unauthenticated');
    res.end();
    return;
  }
  const form = new IncomingForm();
  form.multiples = false;
  form.keepExtensions = true;
  form.maxFileSize = MAX_FILE_SIZE_MB * 1024 * 1024;

  form.parse(req, async (err, _fields, files) => {
    if (err) {
      logger.child({
        success: false, statusCode: 500,
        ms: Date.now() - start,
        errorCode: ErrorType.Unhandled,
      }).error(err);
      next(err);
      return;
    }

    const uploads: { [key: string]: string } = {};
    await Promise.all(Object.keys(files).map(async (fileName) => {
      const file = files[fileName];
      const url = await upload(file, uid);
      uploads[fileName] = url;
    }));

    logger
      .child({ success: true, statusCode: 200, ms: Date.now() - start, })
      .info('success');
    res.status(200).json(uploads);
  });
};
