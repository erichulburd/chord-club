import { Command } from '@oclif/command';
import { initializeApp } from '../util/app';
import { makePool } from '../repositories/db';

export class ExtensionsCommand extends Command {

  static args = [
    {
      name: 'action',               // name of arg to show in help and reference with args[name]
      required: true,            // make the arg required with `required: true`
      description: 'Action to take', // help description
      options: ['run'],        // only allow input to be from a discrete set
    },
  ];

  async run() {
    const pool = makePool();
    const app = initializeApp(pool);

    app.listen({ port: 4000 }, () =>
      console.log('🚀 Server ready at http://localhost:4000')
    );
  }
}
