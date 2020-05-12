import { ApolloServer } from 'apollo-server-express';
import express from 'express';
import { importSchema } from 'graphql-import';
import { makeExecutableSchema, IResolvers } from 'graphql-tools';
import { GraphQLJSON, GraphQLJSONObject } from 'graphql-type-json';
import { makeRequestContext } from './context';
import { getOperationAST, DocumentNode, OperationDefinitionNode } from 'graphql';
import Maybe from 'graphql/tsutils/Maybe';
import { DBClientManager } from '../repositories/db';
import { GetPublicKeyOrSecret } from 'jsonwebtoken';
import bodyParser from 'body-parser';
import * as resolvers from '../resolvers';
import { auth0GetKey } from './auth';
import omit from 'lodash/omit';
import { uploadHandler } from '../handlers/upload';
import { makeMetaMiddleware } from '../handlers/metaMiddleware';
import { health } from '../handlers/health';

export type TopLevelRootValue = Maybe<OperationDefinitionNode>;

export const initializeApp =
  (clientManager: DBClientManager, getKey: GetPublicKeyOrSecret = auth0GetKey): express.Express => {
  const typeDefs = importSchema(`${__dirname}/../../schema/schema.graphql`);
  const r = omit({
    ...resolvers,
    JSON: GraphQLJSON,
    JSONObject: GraphQLJSONObject,
  }, ['__esModule']);
  const schema = makeExecutableSchema({
    typeDefs, resolvers: r as IResolvers,
  });
  const server = new ApolloServer({
    schema,
    context: makeRequestContext(),
    rootValue: (node: DocumentNode): TopLevelRootValue =>
      getOperationAST(node, undefined),
  });
  const app = express();
  app.use(bodyParser.json());

  const metaMiddleware = makeMetaMiddleware(clientManager, getKey);
  app.post('/v1/upload', metaMiddleware, uploadHandler);
  app.get('/v1/health', metaMiddleware, health);
  app.post('/graphql', metaMiddleware);

  server.applyMiddleware({ app });
  return app;
};
