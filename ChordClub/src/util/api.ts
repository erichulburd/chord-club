import mime from 'mime';
import { BASE_URL } from './config';
import { v4 } from 'react-native-uuid';
import auth from '../util/auth';

const API_URL = `${BASE_URL}/v1`

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
      name: parts[parts.length - 1]
    }
    body.append(fileKey, file);
  });

  const res = await fetch(`${API_URL}/upload`, {
    method: 'POST',
    headers: {
      'X-REQUEST-ID': v4(),
      Authorization: `Bearer ${auth.currentState().token}`
    },
    body
  });
  const json = await res.json();
  return json;
}
