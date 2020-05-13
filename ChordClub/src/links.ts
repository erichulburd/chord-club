import {createHttpLink} from 'apollo-link-http';
import {onError} from 'apollo-link-error';
import {setContext} from 'apollo-link-context';
import {RetryLink} from 'apollo-link-retry';
import {ApolloLink} from 'apollo-link';
import logger from './util/logger';
import auth from './util/auth';
import {GQL_URL} from './util/api';
import {requestWithoutTokenError} from './util/errors';
import {v4} from 'react-native-uuid';

const authLink = setContext(async (_request, previousContext) => {
  const token = auth.currentState().token;
  if (!token) {
    throw requestWithoutTokenError;
  }
  return {
    ...previousContext,
    headers: {
      ...previousContext.headers,
      ['X-REQUEST-ID']: v4(),
      Authorization: `Bearer ${token}`,
    },
  };
});

const errorLink = onError(({graphQLErrors, networkError}) => {
  console.log('GRAPHQL ERRORS', graphQLErrors);

  if (graphQLErrors) {
    if (
      graphQLErrors.some((err) => err.extensions?.code === 'UNAUTHENTICATED')
    ) {
      auth.actions.sessionExpired();
    }
    graphQLErrors.forEach(({message, locations, path}) =>
      logger.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
      ),
    );
  }

  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
  }
});

const retryLink = new RetryLink({
  delay: {
    initial: 300,
    max: 10000,
    jitter: true,
  },
  attempts: {
    max: 5,
    retryIf: (error, _operation) => !!error,
  },
});

const httpLink = createHttpLink({uri: GQL_URL});

export default ApolloLink.from([authLink, errorLink, retryLink, httpLink]);
