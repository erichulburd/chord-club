import {
  UserQuery, User, ChartQuery, Chart, TagQuery,
  Tag,
  Extension,
  BaseScopes,
  InvitationQuery,
  PolicyQuery,
  Invitation,
  Policy,
} from '../types';
import { executeUserQuery, findUserByUID } from '../repositories/user';
import { Context } from '../util/context';
import { TopLevelRootValue } from '../util/app';
import { executeChartQuery } from '../repositories/chart';
import { executeTagQuery } from '../repositories/tag';
import { wrapTopLevelOp, Resolver, assertResourceOwner } from './resolverUtils';
import { findAllExtensions } from '../repositories/extensions';
import { forbiddenResourceOpError } from '../util/errors';
import { listInvitations } from '../repositories/invitation';
import { listPolicies } from '../repositories/policy';

interface UsersArgs {
  query: UserQuery;
}

interface ChartsArgs {
  query: ChartQuery;
}

interface TagsArgs {
  query: TagQuery;
}

interface InvitationsArgs {
  query: InvitationQuery;
}

interface PoliciesArgs {
  query: PolicyQuery;
}

interface QueryResolvers {
  me: Resolver<{}, User>;
  users: Resolver<UsersArgs, User[]>;
  charts: Resolver<ChartsArgs, Chart[]>;
  tags: Resolver<TagsArgs, Tag[]>;
  extensions: Resolver<{}, Extension[]>;
  invitations: Resolver<InvitationsArgs, Invitation[]>;
  policies: Resolver<PoliciesArgs, Policy[]>;
}

const Q: Partial<QueryResolvers> = {};

Q.me = wrapTopLevelOp(async (_obj: TopLevelRootValue, args: {}, context: Context): Promise<User> => {
  let me = await findUserByUID(context.uid, context.db);
  if (!me) {
    me = { uid: context.uid, username: '', createdAt: '', settings: {} };
  }
  return me;
});

Q.users = wrapTopLevelOp(async (_obj: TopLevelRootValue, args: UsersArgs, context: Context): Promise<User[]> => {
  return (await executeUserQuery(args.query, context.db)) || [];
});

Q.charts = wrapTopLevelOp(async (_obj: TopLevelRootValue, args: ChartsArgs, context: Context): Promise<Chart[]>  => {
  const permittedScopes = new Set([context.uid, BaseScopes.Public]);
  if (args.query.scopes?.some(s => !permittedScopes.has(s))) {
    throw forbiddenResourceOpError({ scopes: args.query.scopes });
  }
  return (await executeChartQuery(args.query, context.uid, context.db)) || [];
});

Q.tags = wrapTopLevelOp(async (_obj: TopLevelRootValue, args: TagsArgs, context: Context): Promise<Tag[]>  => {
  return (await executeTagQuery(args.query, context.uid, context.db)) || [];
});

Q.extensions = wrapTopLevelOp(async (_obj: TopLevelRootValue, args: {}, context: Context): Promise<Extension[]>  => {
  return findAllExtensions(context.db);
});

Q.invitations = wrapTopLevelOp(async (_obj: TopLevelRootValue, args: InvitationsArgs, context: Context): Promise<Invitation[]>  => {
  await assertResourceOwner(context.uid, args.query.resource, context.db);
  return listInvitations(args.query, context.db);
});

Q.policies = wrapTopLevelOp(async (_obj: TopLevelRootValue, args: PoliciesArgs, context: Context): Promise<Policy[]>  => {
  await assertResourceOwner(context.uid, args.query.resource, context.db);
  return listPolicies(args.query, context.db);
});

export default Q;
