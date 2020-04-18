import { ApolloServer } from 'apollo-server-express';
import express from 'express';
import { IncomingForm } from 'formidable';
import { importSchema } from 'graphql-import';
import { makeExecutableSchema, IResolvers } from 'graphql-tools';
import { makeRequestContext } from './context';
import { getOperationAST, DocumentNode, OperationDefinitionNode } from 'graphql';
import Maybe from 'graphql/tsutils/Maybe';
import { DBClientManager } from '../repositories/db';
import { GetPublicKeyOrSecret } from 'jsonwebtoken';
import bodyParser from 'body-parser';
import * as resolvers from '../resolvers';
import { auth0GetKey, parseAuthorization, getBearerToken, getUID } from './auth';
import { validUploadTypes, MAX_FILE_SIZE_MB, upload } from './gcStorage';

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

  app.post('/api/upload', async (req, res, next) => {
    let uid = await getUID(req.headers.authorization || '', getKey);
    if (!uid) {
      res.status(401);
      res.end();
      return;
    }
    const form = new IncomingForm();
    form.multiples = false;
    form.keepExtensions = true;
    form.maxFileSize = MAX_FILE_SIZE_MB * 1024 * 1024;

    form.parse(req, async (err, _fields, files) => {
      if (err) {
        next(err);
        return;
      }
      const file = Object.values(files)[0];
      if (!validUploadTypes[file.type]) {
        res.status(400);
        res.json({ error: `${file.type} uploads not permitted.` });
        return;
      }
      const url = await upload(file, uid);
      res.json({ url });
    });
  });

  server.applyMiddleware({ app });
  return app;
};


