import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import link from './links';

const cache = new InMemoryCache();

export default new ApolloClient({
  cache,
  link,
  queryDeduplication: true,
});
