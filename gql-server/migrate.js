// migrate.js
const path = require('path');
const { readFileSync } = require('fs');

const requiredConfig = [
  'PGHOST', 'PGPORT', 'PGUSER', 'PGPASSWORD', 'PGDATABASE',
];

const validateConfig = (config) => {
  const missing = requiredConfig.filter((envVar) => !config[envVar]);
  if (missing.length !== 0) {
    throw new Error(`Missing config: ${missing.join(', ')}.`);
  }
};

const parseConfig = () => {
  const SECRET_PATH = process.env.SECRET_PATH;

  if (SECRET_PATH === undefined) {
    throw new Error('Must set SECRET_PATH.');
  }
  const data = readFileSync(SECRET_PATH, { encoding: 'utf-8' });
  const secrets = JSON.parse(data);
  const config = Object.assign({
    PGHOST: process.env.PGHOST,
  }, secrets);
  validateConfig(config);
  return config;
};

const config = parseConfig();

require('node-sql-migrations').run({
  migrationsDir: path.resolve(__dirname, 'migrations'), // This is the directory that should contain your SQL migrations.
  host: config.PGHOST, // Database host
  port: config.PGPORT || '5432', // Database port
  db: config.PGDATABASE, // Database name
  user: config.PGUSER, // Database username
  password: config.PGPASSWORD, // Database password
  adapter: 'pg', // Database adapter: pg, mysql
  // Parameters are optional. If you provide them then any occurrences of the parameter (i.e. FOO) in the SQL scripts will be replaced by the value (i.e. bar).
  parameters: {},
});
