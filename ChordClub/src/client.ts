import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import link from './links';
import { User } from './types';

const cache = new InMemoryCache({
  dataIdFromObject: (obj) => {
    if (obj.__typename === 'User') {
      return (obj as User).uid;
    }
    return obj.id;
  }
});

export default new ApolloClient({
  cache,
  link,
  queryDeduplication: true,
});
