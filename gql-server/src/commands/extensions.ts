import { Command } from '@oclif/command';
import { ExtensionType, Extension } from '../types';
import { makePool } from '../repositories/db';
import { insertExtensions } from '../repositories/extensions';

const defaultBaseExtensions: Extension[] = [
  [2, ExtensionType.Sus],
  [9, ExtensionType.Flat],
  [9, ExtensionType.Plain],
  [9, ExtensionType.Sharp],
  [4, ExtensionType.Sus],
  [11, ExtensionType.Plain],
  [11, ExtensionType.Sharp],
  [5, ExtensionType.Flat],
  [5, ExtensionType.Sharp],
  [13, ExtensionType.Flat],
  [13, ExtensionType.Plain],
  [7, ExtensionType.Flat],
  [7, ExtensionType.Plain],
].map(([degree, extensionType]) => ({
  degree, extensionType,
} as Extension));

export class ExtensionsCommand extends Command {

  static args = [
    {
      name: 'action',               // name of arg to show in help and reference with args[name]
      required: true,            // make the arg required with `required: true`
      description: 'Action to take', // help description
      options: ['seed'],        // only allow input to be from a discrete set
    },
  ];

  async run() {
    const pool = makePool();
    const client = await pool.connect();
    await client.query('BEGIN');
    try {
      await insertExtensions(defaultBaseExtensions, client);
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      console.error(err);
    }
  }
}
