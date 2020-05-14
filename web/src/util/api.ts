import * as qs from 'querystring';

export interface QueryOptions {
  randomDelay?: 'true' | 'false';
  prefix: string;
  count: string;
  [key: string]: string;
}

export interface ApiOptions {
  // https://developer.mozilla.org/en-US/docs/Web/API/Request/cache
  cacheMode: 'reload' | 'no-cache';
}

const BASE_URL = '//vertauiinterview3zcck5-env.c3jmih47du.us-east-1.elasticbeanstalk.com';

export const search = async (opts: QueryOptions, cache: boolean): Promise<string[]> => {
  const query = qs.stringify({
    randomDelay: 'false',
    ...opts,
  });
  const res = await fetch(`${BASE_URL}/search?${query}`, {
    cache: cache ? 'reload' : 'no-cache',
  });
  const body = await res.json();
  return body.results as string[];
};

export const download = async (file: string, cache: boolean): Promise<string> => {
  const res = await fetch(`${BASE_URL}/static/${file}`, {
    cache: cache ? 'reload' : 'no-cache',
  });
  return res.text();
};
