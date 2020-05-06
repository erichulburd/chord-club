import {ApolloClient} from 'apollo-client';
import {
  InMemoryCache,
  IntrospectionFragmentMatcher,
} from 'apollo-cache-inmemory';
import link from './links';
import introspectionQueryResultData from './fragmentTypes.json';
import {User} from './types';

const fragmentMatcher = new IntrospectionFragmentMatcher({
  introspectionQueryResultData,
});

const cache = new InMemoryCache({
  // fragmentMatcher,
  dataIdFromObject: (obj) => {
    if (obj.__typename === 'User') {
      return (obj as User).uid;
    }
    return obj.id;
  },
});

export default new ApolloClient({
  cache,
  link,
  queryDeduplication: true,
});
