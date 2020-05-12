import { Pool, PoolClient } from 'pg';
import { snakeCase, pickBy, flatten, uniq } from 'lodash';
import { config } from '../util/config';

export type Tx = number;

export type Queryable = Pool | PoolClient;

// During run, initialize app with pool. Each request gets a new AppDbTx.
// During tests, initialize app with AppDBTx. Each request get a nested AppDBTx
// WARNING: This is not parallelizable. In other words, a transaction should
// only safely spawn transactions from the same thread.
export class DBTxManager {
  public queryable: Queryable;
  public savepoint = 0;

  constructor(queryable: Queryable) {
    this.queryable = queryable;
  }

  public async begin() {
    if (this.savepoint === 0) {
      await this.queryable.query('BEGIN');
    } else {
      await this.queryable.query(`SAVEPOINT sp${this.savepoint}`);
    }
    const txNumber = this.savepoint;
    this.savepoint += 1;
    return txNumber;
  }

  public async rollbackTx(savepoint: Tx) {
    if (savepoint === 0) {
      await this.queryable.query('ROLLBACK');
    } else {
      await this.queryable.query(`ROLLBACK TO SAVEPOINT sp${savepoint}`);
    }
    this.savepoint = savepoint;
  }

  public async commit(savepoint: Tx) {
    if (savepoint === 0) {
      await this.queryable.query('COMMIT');
    } else {
      await this.queryable.query(`RELEASE SAVEPOINT sp${savepoint}`);
    }
    this.savepoint = savepoint;
  }
}

export class DBClientManager {
  public pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  public queryable(): PoolClient | Pool {
    return this.pool;
  }

  public releaseClient(client: PoolClient) {
    client.release();
  }

  public async newConnection(): Promise<[PoolClient, DBTxManager]> {
    const client = await this.pool.connect();
    const txManager = new DBTxManager(client);
    return [client, txManager];
  }
}

export class TestDBClientManager extends DBClientManager {
  private client: PoolClient | undefined;
  private txManager: DBTxManager | undefined;

  public async initialize() {
    const client = await this.pool.connect();
    this.client = client;
    const txManager = new DBTxManager(this.client);
    await txManager.begin();
    this.txManager = txManager;
  }

  public queryable() {
    if (!this.client) {
      throw new Error('TestDBClientManager has not been initialized.');
    }
    return this.client;
  }

  public releaseClient(_queryable: Queryable) {
    // do not release clients during testing, so we can roll the
    // transactions back in tests rather than on the server.
  }

  public async newConnection(): Promise<[PoolClient, DBTxManager]> {
    if (!this.client || !this.txManager) {
      throw new Error('TestDBClientManager has not been initialized.');
    }
    return [this.client, this.txManager];
  }

  public async rollbackAndRelease() {
    if (!this.client || !this.txManager) {
      throw new Error('TestDBClientManager has not been initialized.');
    }
    await this.txManager.rollbackTx(0);
    this.client.release();
  }

  public static async new(pool: Pool) {
    const testDBClientManager = new TestDBClientManager(pool);
    await testDBClientManager.initialize();
    return testDBClientManager;
  }
}

export const makeDBPool = () => new Pool({
  host: config.PGHOST,
  user: config.PGUSER,
  password: config.PGPASSWORD,
  port: config.PGPORT ? parseInt(config.PGPORT, 10) : undefined,
  database: config.PGDATABASE,
  // ssl: { ca: '', cert: '', },
  max: 100,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

export const makeDBClientManager = () => new DBClientManager(makeDBPool());

interface DynamicValues<T> {
  [key: string]: string | ((val: T) => string);
}

const isCallable = (s: any) => typeof s === 'function' || s instanceof Function;

const getDynamicValue = <T>(
  val: T,
  dynamicColumns: string[],
  dynamicValues: DynamicValues<T>
): string => {
  if (dynamicColumns.length <= 0) {
    return '';
  }
  return ', ' + dynamicColumns.map((c) =>
    isCallable(dynamicValues[c]) ?
      (dynamicValues[c] as Function)(val) :
      dynamicValues[c]).join(', ');
};

export const prepareDBInsert = <T extends Record<string, any>>(
  values: T[], columnWhitelist?: string[],
  dynamicValues: DynamicValues<T> = {},
) => {
  const dbValues: DBUpdate[] = values.map(o => Object.keys(o).reduce((prev, k) =>
    o[k] === undefined ? prev : ({
      ...prev,
      [snakeCase(k)]: o[k],
    }),
  {}));

  let columns = uniq(flatten(dbValues.map(val => Object.keys(val))));
  if (columnWhitelist) {
    columns = columns.filter(c => columnWhitelist.includes(c));
  }

  const dynamicColumns = Object.keys(dynamicValues);

  const prep = dbValues.map((_val, i) =>
    '(' +
      columns.map((_k, j) => `$${i * columns.length + j + 1}`).join(', ') +
      getDynamicValue(values[i], dynamicColumns, dynamicValues) +
    ')'
  ).join(', ');
  const pgValues = flatten(dbValues.map((val) => columns.map((c) => val[c])));
  return {
    columns: columns.concat(dynamicColumns.map(snakeCase)).join(', '),
    prep,
    values: pgValues,
  };
};

interface DBUpdate {
  [key: string]: any;
}

export const prepareDBUpdate = (values: DBUpdate, columnWhitelist?: string[]) => {
  const definedValues: DBUpdate = pickBy(values, (v) => v !== undefined);
  const dbValues: DBUpdate = Object.keys(definedValues).reduce((prev, k) => ({
    ...prev,
    [snakeCase(k)]: definedValues[k],
  }), {});
  let dbColumns = Object.keys(dbValues);
  if (columnWhitelist) {
    dbColumns = dbColumns.filter(c => columnWhitelist.includes(c));
  }
  const prep = dbColumns.map((c, i) => `${c} = $${i+1}`).join(', ');
  const pgValues = dbColumns.map((c) => dbValues[c]);
  return { prep, values: pgValues };
};

export interface DBFieldsToAttr {
  [key: string]: string;
}

export const makeDBFields = (attrs: string[]) => attrs.map((attr) => snakeCase(attr));
export const makeSelectFields = (dbFields: string[], table: string) =>
  dbFields.map((field) => `${table}.${field}`).join(', ');

const makeDBFieldsToAttr = (attrs: string[]): DBFieldsToAttr =>
  attrs.reduce((prev, attr) => ({
    ...prev,
    [snakeCase(attr)]: attr,
  }), {});

interface GQLType {
  __typename?: string;
}

export const makeDBDataToObject = <U extends GQLType>(attrs: string[], __typename: string) => {
  const dbFieldsToAttr: DBFieldsToAttr = makeDBFieldsToAttr(attrs);
  return (row: {[key: string]: any}): U => {
    return Object.keys(row).reduce((prev, dbField) => ({
      ...prev,
      [dbFieldsToAttr[dbField]]: row[dbField],
    }), { __typename }) as U;
  };
};
