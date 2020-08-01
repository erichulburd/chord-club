import { Storage, UploadOptions, CreateReadStreamOptions } from '@google-cloud/storage';
import path from 'path';
import { v4 } from 'uuid';
import { File } from 'formidable';
import mimeTypes from 'mime-types';
import { config } from './config';

export const MAX_FILE_SIZE_MB = 500;

const storage = new Storage({
  projectId: config.GC_PROJECT_ID,
  keyFilename: config.GC_STORAGE_KEYFILE,
});

export const GC_STORAGE_BUCKET_NAME = config.GC_STORAGE_BUCKET_NAME || '';
export const GC_STORAGE_URL_BASE =
  `https://storage.googleapis.com/${GC_STORAGE_BUCKET_NAME}`;

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

export const createReadStream = (fileName: string, opts: CreateReadStreamOptions = {}) => {
  const bucket = storage.bucket(GC_STORAGE_BUCKET_NAME);
  const file = bucket.file(fileName);
  return file.createReadStream(opts)
};
