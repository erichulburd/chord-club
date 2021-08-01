import { writeFileSync, mkdirSync, existsSync } from 'fs';
import * as path from 'path';

interface Config {
  PGHOST: string;
  PGPORT: string;
  PGUSER: string;
  PGPASSWORD: string;
  PGDATABASE: string;
  AUTH0_DOMAIN: string;
  AUTH0_CLIENT_ID: string;
  AUTH0_AUDIENCE: string;
  GC_PROJECT_ID: string;
  GC_STORAGE_KEYFILE: string;
  GC_STORAGE_KEYFILE_B64: string;
  GC_STORAGE_BUCKET_NAME: string;
  CHORD_CLUB_TOKEN_AUDIENCE: string;
  CHORD_CLUB_TOKEN_ISSUER: string;
  CHORD_CLUB_TOKEN_KID: string;
  JWKS_B64: string;
  PRIVATE_SIGNING_KEY_B64: string;
  PORT: string;
  [key: string]: string;
}

const requiredConfig = [
  'PGHOST', 'PGPORT', 'PGUSER', 'PGPASSWORD', 'PGDATABASE',
  'AUTH0_DOMAIN', 'AUTH0_CLIENT_ID', 'AUTH0_AUDIENCE',
  'GC_PROJECT_ID', 'GC_STORAGE_KEYFILE_B64', 'GC_STORAGE_BUCKET_NAME',
  'JWKS_B64', 'PRIVATE_SIGNING_KEY_B64',
];

const defaults: Partial<Config> = {
  CHORD_CLUB_TOKEN_AUDIENCE: 'chordclub.app',
  CHORD_CLUB_TOKEN_ISSUER: 'chordclub.app',
  CHORD_CLUB_TOKEN_KID: '01',
  PORT: '4000',
}

const validateConfig = (config: Partial<Config>) => {
  const missing = requiredConfig.filter((envVar) => !config[envVar]);
  if (missing.length !== 0) {
    throw new Error(`Missing config: ${missing.join(', ')}.`);
  }
};

const parseConfig = (): Config => {
  const configFromEnv: Config = requiredConfig.reduce((prev, envVar) => {
    return {
      ...prev,
      [envVar]: process.env[envVar],
    }
  }, defaults) as Config;
  validateConfig(configFromEnv);
  setupGCStorageKeyFile(configFromEnv);
  return configFromEnv;
};

const setupGCStorageKeyFile = (config: Config) => {
  const basePath = path.join(__dirname, '..', 'env');
  try {
    mkdirSync(basePath);
  } catch (err) {
    console.error(err);
  }
  process.env.GC_STORAGE_KEYFILE = path.join(basePath, 'chord-club.json');
  if (existsSync(process.env.GC_STORAGE_KEYFILE)) {
    return;
  }
  writeFileSync(
    process.env.GC_STORAGE_KEYFILE,
    Buffer.from(config.GC_STORAGE_KEYFILE_B64),
    { encoding: 'utf-8' },
  );
};

export const config = parseConfig();
