import { User, Tag } from '../types';
import { Context } from '../util/context';
import { Resolver } from './resolverUtils';

export const creator: Resolver<{}, User, Tag> = async (
  tag: Tag, args: {}, context: Context,
): Promise<User> => {
  return context.loaders.usersByUID.load(tag.createdBy);
};
