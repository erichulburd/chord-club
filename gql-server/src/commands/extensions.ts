import { ExtensionType, ExtensionNew } from '../types';
import { makeDBPool } from '../repositories/db';
import { insertExtensions } from '../repositories/extensions';

const defaultBaseExtensions: ExtensionNew[] = [
  [9, ExtensionType.Flat],
  [9, ExtensionType.Plain],
  [9, ExtensionType.Sharp],
  [11, ExtensionType.Plain],
  [11, ExtensionType.Sharp],
  [5, ExtensionType.Flat],
  [5, ExtensionType.Sharp],
  [6, ExtensionType.Plain],
  [13, ExtensionType.Flat],
  [13, ExtensionType.Plain],
  [7, ExtensionType.Flat],
  [7, ExtensionType.Plain],
].map(([degree, extensionType]) => ({
  degree, extensionType,
} as ExtensionNew));

const run = async () => {
  const pool = makeDBPool();
  const client = await pool.connect();
  await client.query('BEGIN');
  try {
    await insertExtensions(defaultBaseExtensions, client);
    await client.query('COMMIT');
    await client.release();
    await pool.end();
  } catch (err) {
    await client.query('ROLLBACK');
    await client.release();
    await pool.end();
    process.exit(err);
  }
}

run();
