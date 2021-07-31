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
  return configFromEnv;
};

export const config = parseConfig();
