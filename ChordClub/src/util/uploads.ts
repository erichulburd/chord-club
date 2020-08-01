import {upload} from './api';

export interface FileURLCache {
  [key: string]: string;
}

export interface FileUploadResult<T extends Record<string, string>> {
  urls: T;
  cache: FileURLCache;
  didUpload: boolean;
}

export const uploadFilesIfNecessary = async <T extends Record<string, string>>(
  fileLocalPaths: T,
  existingUploadCache: FileURLCache,
): Promise<FileUploadResult<T>> => {
  const filesToUpload = {} as Record<string, string>;
  const urls = {} as Record<string, string>;
  Object.keys(fileLocalPaths).forEach((key) => {
    urls[key] = existingUploadCache[fileLocalPaths[key]];
    if (urls[key] === undefined && fileLocalPaths[key]) {
      filesToUpload[key] = fileLocalPaths[key];
    }
  });
  let cache = existingUploadCache;
  let didUpload = false;
  if (Object.keys(filesToUpload).length > 0) {
    cache = {...existingUploadCache};
    console.log('filesToUpload', filesToUpload)
    const newURLs = await upload(filesToUpload);
    Object.keys(newURLs).forEach((key) => {
      const filePath = fileLocalPaths[key];
      const url = newURLs[key];
      cache[filePath] = url;
      urls[key] = url;
    });
    didUpload = true;
  }
  return {didUpload, urls: urls as T, cache};
};
