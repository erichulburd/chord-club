import {
  UserQuery, User, ChartQuery, Chart, TagQuery,
  Tag,
  Extension,
} from '../types';
import { executeUserQuery } from '../repositories/user';
import { Context } from '../util/context';
import { TopLevelRootValue } from '../util/app';
import { executeChartQuery } from '../repositories/chart';
import { executeTagQuery } from '../repositories/tag';
import { wrapTopLevelOp, Resolver } from './resolverUtils';
import { findAllExtensions } from '../repositories/extensions';

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
  users: Resolver<UsersArgs, User[]>;
  charts: Resolver<ChartsArgs, Chart[]>;
  tags: Resolver<TagsArgs, Tag[]>;
  extensions: Resolver<{}, Extension[]>;
}

const Q: Partial<QueryResolvers> = {};

Q.users = wrapTopLevelOp(async (_obj: TopLevelRootValue, args: UsersArgs, context: Context): Promise<User[]> => {
  return (await executeUserQuery(args.query, context.db)) || [];
});

Q.charts = wrapTopLevelOp(async (_obj: TopLevelRootValue, args: ChartsArgs, context: Context): Promise<Chart[]>  => {
  return (await executeChartQuery(args.query, context.uid, context.db)) || [];
});

Q.tags = wrapTopLevelOp(async (_obj: TopLevelRootValue, args: TagsArgs, context: Context): Promise<Tag[]>  => {
  return (await executeTagQuery(args.query, context.uid, context.db)) || [];
});

Q.extensions = wrapTopLevelOp(async (_obj: TopLevelRootValue, args: {}, context: Context): Promise<Extension[]>  => {
  return findAllExtensions(context.db);
});

export default Q;
