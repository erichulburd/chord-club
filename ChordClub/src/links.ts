import { createHttpLink } from "apollo-link-http";
import { onError } from "apollo-link-error";
import { setContext } from "apollo-link-context";
import { RetryLink } from "apollo-link-retry";
import { ApolloLink } from 'apollo-link';
import logger from './util/logger';
import { getToken, sessionExpired } from "./util/auth";
import { requestWithoutTokenError } from "./util/errors";


const authLink = setContext(async (_request, previousContext) => {
    const token = getToken();
    if (!token) {
      throw requestWithoutTokenError;
    }
    return {
      headers: { ...previousContext, authorization: `Bearer ${token}` },
    };
  }
);

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    if (graphQLErrors.some((err) => err.extensions?.code === 'UNAUTHENTICATED')) {
      sessionExpired()
    }
    graphQLErrors.forEach(({ message, locations, path, extensions }) =>
      logger.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      )
    );
  }

  if (networkError) console.error(`[Network error]: ${networkError}`);
});

const retryLink = new RetryLink({
  delay: {
    initial: 300,
    max: 10000,
    jitter: true
  },
  attempts: {
    max: 5,
    retryIf: (error, _operation) => !!error
  }
});

const GQL_URL = 'http://localhost:4000/graphql';
const httpLink = createHttpLink({ uri: GQL_URL });

export default ApolloLink.from([
  authLink,
  errorLink,
  retryLink,
  httpLink,
]);
