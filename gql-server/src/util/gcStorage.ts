import { Storage, UploadOptions } from '@google-cloud/storage';
import path from 'path';
import { v4 } from 'uuid';
import { File } from 'formidable';
import mimeTypes from 'mime-types';

export const MAX_FILE_SIZE_MB = 500;


const storage = new Storage({
  projectId: process.env.GC_PROJECT_ID,
  keyFilename: process.env.GC_STORAGE_KEYFILE,
});

export const GC_STORAGE_BUCKET_NAME = process.env.GC_STORAGE_BUCKET_NAME || '';
export const GC_STORAGE_URL_BASE =
  `https://storage.googleapis.com/${process.env.GC_STORAGE_BUCKET_NAME}`;

export const upload = async (file: File, uid: string, opts: UploadOptions = {}) => {
  const bucket = storage.bucket(GC_STORAGE_BUCKET_NAME);
  const fileName = path.join(
    uid.replace('|', '-'),
    [v4(), mimeTypes.extension(file.type)].join('.'));

  await bucket.upload(file.path, {
    ...opts,
    destination: fileName,
  });
  return `${GC_STORAGE_URL_BASE}/${fileName}`;
};
