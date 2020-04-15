// migrate.js
const path = require('path');

require('node-sql-migrations').run({
  migrationsDir: path.resolve(__dirname, 'migrations'), // This is the directory that should contain your SQL migrations.
  host: process.env.PGHOST, // Database host
  port: process.env.PGPORT || '5432', // Database port
  db: process.env.PGDATABASE, // Database name
  user: process.env.PGUSER, // Database username
  password: process.env.PGPASSWORD, // Database password
  adapter: 'pg', // Database adapter: pg, mysql
  // Parameters are optional. If you provide them then any occurrences of the parameter (i.e. FOO) in the SQL scripts will be replaced by the value (i.e. bar).
  parameters: {},
});
