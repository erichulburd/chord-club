import { ApolloServer } from 'apollo-server-express';
import express, { Request } from 'express';
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
import { auth0GetKey, getUID } from './auth';
import { MAX_FILE_SIZE_MB, upload } from './gcStorage';
import baseLogger from './logger';
import { ErrorType } from '../types';
import { PoolClient } from 'pg';

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

  app.post('/v1/upload', async (req, res, next) => {
    const start = Date.now();
    const uid = await getUID(req.headers.authorization || '', getKey);
    const logger = baseLogger.child({
      uid,
      requestID: req.headers['X-REQUEST-ID'],
      path: req.path,
    });
    if (!uid) {
      res.status(401);
      logger.child({
        success: false, statusCode: 401,
        ms: Date.now() - start,
        errorCode: ErrorType.Unauthenticated,
      }).error('unauthenticated');
      res.end();
      return;
    }
    const form = new IncomingForm();
    form.multiples = false;
    form.keepExtensions = true;
    form.maxFileSize = MAX_FILE_SIZE_MB * 1024 * 1024;

    form.parse(req, async (err, _fields, files) => {
      if (err) {
        logger.child({
          success: false, statusCode: 500,
          ms: Date.now() - start,
          errorCode: ErrorType.Unhandled,
        }).error(err);
        next(err);
        return;
      }

      const uploads: { [key: string]: string } = {};
      await Promise.all(Object.keys(files).map(async (fileName) => {
        const file = files[fileName];
        const url = await upload(file, uid);
        uploads[fileName] = url;
      }));


      logger
        .child({ success: true, statusCode: 200, ms: Date.now() - start, })
        .info('success');
      res.status(200).json(uploads);
    });
  });

  app.post('/graphql', async (req, _res, next) => {
    const [db, _] = await clientManager.newConnection();
    (req as RequestWithMeta)._meta = { db };
    try {
      next();
    } finally {
      clientManager.releaseClient(db);
    }
  });

  server.applyMiddleware({ app });
  return app;
};

export interface RequestWithMeta extends Request {
  _meta: {
    db: PoolClient;
  };
}

