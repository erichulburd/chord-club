import { initializeApp } from './util/app';
import { makeDBClientManager } from './repositories/db';


const start = async () => {
  const dbClientManger = makeDBClientManager();
  const app = initializeApp(dbClientManger);

  app.listen({ port: 4000 }, () =>
    console.log('🚀 Server ready at http://localhost:4000')
  );
};

start();
