import config, {NativeConfig} from 'react-native-config';

interface Config extends NativeConfig {
  API_BASE_URL: string;
  GRAPHQL_URL: string;
  AUTH0_DOMAIN: string;
  AUTH0_CLIENT_ID: string;
  AUTH0_TOKEN_AUDIENCE: string;
}

const requiredVariables = [
  'API_BASE_URL',
  'AUTH0_DOMAIN',
  'AUTH0_CLIENT_ID',
  'AUTH0_TOKEN_AUDIENCE',
  'WEB_BASE_URL',
];

const validateConfiguration = (conf: NativeConfig) => {
  const missing = requiredVariables.filter((name) => !conf[name]);
  if (missing.length > 0) {
    throw new Error(
      `App failed to start. Missing variables: ${missing.join(', ')}`,
    );
  }
};

validateConfiguration(config);

export default config as Config;
