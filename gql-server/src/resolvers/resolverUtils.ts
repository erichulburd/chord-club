import { Context } from '../util/context';
import { TopLevelRootValue } from '../util/app';
import { unauthenticatedError, coerceUnhandledError } from '../util/errors';
import { PolicyResource, PolicyResourceType } from '../types';
import { findTagByID } from '../repositories/tag';
import { Queryable } from '../repositories/db';
import { forbiddenResourceOpError } from '../util/errors';

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

export const assertResourceOwner = async (
  uid: string, resource: PolicyResource, db: Queryable) => {
  switch (resource.resourceType) {
    case PolicyResourceType.Tag:
      const tag = await findTagByID(resource.resourceID, uid, db);
    if (tag === undefined) {
      throw forbiddenResourceOpError(resource);
    }
  }
}
