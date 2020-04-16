import { ApolloServer } from 'apollo-server-express';
import express from 'express';
import { importSchema } from 'graphql-import';
import { makeExecutableSchema, IResolvers } from 'graphql-tools';
import { makeRequestContext } from './context';
import { getOperationAST, DocumentNode, OperationDefinitionNode } from 'graphql';
import Maybe from 'graphql/tsutils/Maybe';
import { DBClientManager } from '../repositories/db';
import { GetPublicKeyOrSecret } from 'jsonwebtoken';
import bodyParser from 'body-parser';
import * as resolvers from '../resolvers';
import { auth0GetKey } from './auth';

export type TopLevelRootValue = Maybe<OperationDefinitionNode>;

export const initializeApp =
  (clientManager: DBClientManager, getKey: GetPublicKeyOrSecret = auth0GetKey): express.Express => {
  const typeDefs = importSchema(`${__dirname}/../../schema/schema.graphql`);
  const schema = makeExecutableSchema({
    typeDefs, resolvers: resolvers as IResolvers,
  });
  const server = new ApolloServer({
    schema,
    context: makeRequestContext(clientManager, getKey),
    rootValue: (node: DocumentNode): TopLevelRootValue =>
      getOperationAST(node, undefined),
  });
  const app = express();
  app.use(bodyParser.json());

  server.applyMiddleware({ app });
  return app;
};


