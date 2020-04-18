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
  let tx: Tx | undefined = undefined;
  try {
    if (!context.uid) {
      throw unauthenticatedError;
    }

    tx = await context.txManager.begin();
    const res: U = await fn(obj, args, context);
    await context.txManager.commit(tx);
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
    try {
      if (tx !== undefined) {
        await context.txManager.rollbackTx(tx);
      }
    } catch(txErr) {
      logger.error('database rollback failed');
    }
    throw err;
  } finally {
    context.dbClientManager.releaseClient(context.db);
  }
};
