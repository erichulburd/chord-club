import mime from 'mime';
import config from './config';
import {v4} from 'react-native-uuid';
import auth from '../util/auth';
import {GraphQLError} from 'graphql';

const BASE_URL = config.API_BASE_URL

const API_URL = `${BASE_URL}/v1`;
export const GQL_URL = `${BASE_URL}/graphql`;

export interface FileUploads {
  [key: string]: string;
}

export const upload = async <T extends FileUploads>(files: T): Promise<T> => {
  const body = new FormData();
  Object.keys(files).forEach((fileKey) => {
    const filePath = files[fileKey];
    const parts = filePath.split('/');
    const file = {
      type: mime.getType(filePath),
      uri: filePath,
      name: parts[parts.length - 1],
    };
    body.append(fileKey, file);
  });

  const res = await fetch(`${API_URL}/upload`, {
    method: 'POST',
    headers: {
      'X-REQUEST-ID': v4(),
      Authorization: `Bearer ${auth.currentState().token}`,
    },
    body,
  });
  const json = await res.json();
  return json;
};

interface GraphQLResponse<T> {
  data: T;
  errors: GraphQLError;
}

export const graphql = async <T, U>(
  query: string,
  variables: T,
): Promise<GraphQLResponse<U>> => {
  const res = await fetch(GQL_URL, {
    method: 'POST',
    headers: {
      'X-REQUEST-ID': v4(),
      Authorization: `Bearer ${auth.currentState().token}`,
      'Content-Type': 'application/json',
    },
    body: {query, variables},
  });
  const json = await res.json();
  return json;
};
