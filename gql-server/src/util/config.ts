import { readFileSync } from 'fs';

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
  GC_STORAGE_BUCKET_NAME: string;
  CHORD_CLUB_TOKEN_AUDIENCE: string;
  CHORD_CLUB_TOKEN_ISSUER: string;
  CHORD_CLUB_TOKEN_KID: string;
  PORT: string;
  [key: string]: string;
}

const requiredConfig = [
  'PGHOST', 'PGPORT', 'PGUSER', 'PGPASSWORD', 'PGDATABASE',
  'AUTH0_DOMAIN', 'AUTH0_CLIENT_ID', 'AUTH0_AUDIENCE',
  'GC_PROJECT_ID', 'GC_STORAGE_KEYFILE', 'GC_STORAGE_BUCKET_NAME',
];

const validateConfig = (config: Partial<Config>) => {
  const missing = requiredConfig.filter((envVar) => !config[envVar]);
  if (missing.length !== 0) {
    throw new Error(`Missing config: ${missing.join(', ')}.`);
  }
};

const parseConfig = (): Config => {
  const SECRET_PATH = process.env.SECRET_PATH;

  if (SECRET_PATH === undefined) {
    throw new Error('Must set SECRET_PATH.');
  }
  const data = readFileSync(SECRET_PATH, { encoding: 'utf-8' });
  const secrets = JSON.parse(data);
  const config: Config = {
    PGHOST: process.env.PGHOST,
    CHORD_CLUB_TOKEN_AUDIENCE: 'chordclub.app',
    CHORD_CLUB_TOKEN_ISSUER: 'chordclub.app',
    CHORD_CLUB_TOKEN_KID: '01',
    PORT: '4000',
    ...secrets,
  };
  validateConfig(config);
  return config;
};

export const config = parseConfig();
