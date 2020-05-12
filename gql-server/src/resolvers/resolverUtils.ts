import { Context } from '../util/context';
import { TopLevelRootValue } from '../util/app';
import { unauthenticatedError, coerceUnhandledError } from '../util/errors';

export type Resolver<T, U, V = TopLevelRootValue> =
  (obj: V, args: T, context: Context) => Promise<U>;

export const wrapTopLevelOp =
  <T, U>(fn: Resolver<T, U>): Resolver<T, U> =>
  async (obj: TopLevelRootValue, args: T, context: Context) => {
  const start = Date.now();
  let logger = context.logger.child({
    start,
    op: obj?.name?.value,
  });
  try {
    if (!context.uid) {
      throw unauthenticatedError;
    }
    const res: U = await fn(obj, args, context);
    logger.child({ ms: Date.now() - start, success: true, }).info('success');
    return res;
  } catch (err) {
    const apolloError = coerceUnhandledError(err);
    logger = logger.child({
      ms: Date.now() - start,
      success: false,
      errorCode: apolloError.code,
    });
    logger.error(err);
    throw apolloError;
  }
};
