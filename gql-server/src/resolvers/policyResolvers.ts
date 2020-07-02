import { User, Policy } from '../types';
import { Context } from '../util/context';
import { Resolver } from './resolverUtils';

export const user: Resolver<{}, User, Policy> = async (
  policy: Policy, args: {}, context: Context,
): Promise<User> => {
  return context.loaders.usersByUID.load(policy.uid);
};
