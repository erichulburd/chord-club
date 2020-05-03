import {
  UserQuery, User, ChartQuery, Chart, TagQuery,
  Tag,
  Extension,
  BaseScopes,
} from '../types';
import { executeUserQuery, findUserByUID } from '../repositories/user';
import { Context } from '../util/context';
import { TopLevelRootValue } from '../util/app';
import { executeChartQuery } from '../repositories/chart';
import { executeTagQuery } from '../repositories/tag';
import { wrapTopLevelOp, Resolver } from './resolverUtils';
import { findAllExtensions } from '../repositories/extensions';
import { forbiddenResourceOpError } from '../util/errors';

interface UsersArgs {
  query: UserQuery;
}

interface ChartsArgs {
  query: ChartQuery;
}

interface TagsArgs {
  query: TagQuery;
}

interface QueryResolvers {
  me: Resolver<{}, User>;
  users: Resolver<UsersArgs, User[]>;
  charts: Resolver<ChartsArgs, Chart[]>;
  tags: Resolver<TagsArgs, Tag[]>;
  extensions: Resolver<{}, Extension[]>;
}

const Q: Partial<QueryResolvers> = {};

Q.me = wrapTopLevelOp(async (_obj: TopLevelRootValue, args: {}, context: Context): Promise<User> => {
  let me = await findUserByUID(context.uid, context.db);
  if (!me) {
    me = { uid: context.uid, username: '', createdAt: '' };
  }
  return me;
});

Q.users = wrapTopLevelOp(async (_obj: TopLevelRootValue, args: UsersArgs, context: Context): Promise<User[]> => {
  return (await executeUserQuery(args.query, context.db)) || [];
});

Q.charts = wrapTopLevelOp(async (_obj: TopLevelRootValue, args: ChartsArgs, context: Context): Promise<Chart[]>  => {
  const permittedScopes = new Set([context.uid, BaseScopes.Public]);
  if (args.query.scopes?.some(s => !permittedScopes.has(s))) {
    throw forbiddenResourceOpError();
  }
  return (await executeChartQuery(args.query, context.uid, context.db)) || [];
});

Q.tags = wrapTopLevelOp(async (_obj: TopLevelRootValue, args: TagsArgs, context: Context): Promise<Tag[]>  => {
  return (await executeTagQuery(args.query, context.uid, context.db)) || [];
});

Q.extensions = wrapTopLevelOp(async (_obj: TopLevelRootValue, args: {}, context: Context): Promise<Extension[]>  => {
  return findAllExtensions(context.db);
});

export default Q;
