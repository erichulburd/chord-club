import { Context } from '../util/context';
import { TopLevelRootValue } from '../util/app';
import { Tx } from '../repositories/db';
import { ApolloError } from 'apollo-server-express';
import { unauthenticatedError } from '../util/errors';
import { ErrorType } from '../types';

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
    logger = logger.child({
      ms: Date.now() - start,
      success: false,
      errorCode: (err instanceof ApolloError ?
        err.code : ErrorType.Unhandled),
    });
    logger.error(err);
    throw err;
  }
};
