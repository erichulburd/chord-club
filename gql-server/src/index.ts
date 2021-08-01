import { initializeApp } from './util/app';
import { makeDBClientManager } from './repositories/db';


const start = async () => {
  const dbClientManger = makeDBClientManager();
  const app = initializeApp(dbClientManger);

  const port = process.env.PORT || '4000';

  app.listen({ port }, () => {
    console.log(`🚀 Server ready at http://localhost:${port}`)
  });
};

start();
