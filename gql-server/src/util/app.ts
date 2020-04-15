import { ApolloServer } from 'apollo-server-express';
import express from 'express';
import { importSchema } from 'graphql-import';
import { makeExecutableSchema } from 'graphql-tools';
import { makeRequestContext } from './context';
import { getOperationAST, DocumentNode, OperationDefinitionNode } from 'graphql';
import Maybe from 'graphql/tsutils/Maybe';
import { AppDBPool } from '../repositories/db';

export type TopLevelRootValue = Maybe<OperationDefinitionNode>;

export const initializeApp = (pool: AppDBPool) => {
  const typeDefs = importSchema(`${__dirname}/../../schema/schema.graphql`);
  const schema = makeExecutableSchema({
    typeDefs, schemaDirectives: {  }
  });
  const server = new ApolloServer({
    typeDefs, schema, resolvers: {},
    context: makeRequestContext(pool),
    rootValue: (node: DocumentNode): TopLevelRootValue =>
      getOperationAST(node, undefined),
  });
  const app = express();
  // app.use(bodyParser());
  server.applyMiddleware({ app });
  return app;
};


