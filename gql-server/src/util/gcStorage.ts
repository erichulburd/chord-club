import { Storage, UploadOptions } from '@google-cloud/storage';
import path from 'path';
import uuid from 'uuid';
import { File } from 'formidable';

export const MAX_FILE_SIZE_MB = 500;

export const validUploadTypes: { [key: string]: string } = {
  'audio/mpeg3': 'mp3',
  'audio/x-mpeg-3': 'mp3',
  'audio/wav': 'wav',
  'audio/x-wav': 'wav',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
};

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
    uid,
    [uuid.v4(), validUploadTypes[file.type]].join('.'));

  const gcFile = bucket.file(file.name);

  await bucket.upload(file.path, opts)
  await gcFile.makePublic();
  return `${GC_STORAGE_URL_BASE}/${fileName}`;
};
