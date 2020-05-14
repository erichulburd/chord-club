import * as mapStackTrace from 'sourcemapped-stacktrace';
import { isEmpty } from 'lodash';
import { isDevelopment } from './environment';

const silenceAlerts = window.location.search.search('silence') >= 0;

export const getMappedStack = async (err: Error): Promise<string[]> => {
  return new Promise<string[]>((done: (t: string[]) => void) => {
    if (err.stack) {
      mapStackTrace.mapStackTrace(err.stack, done);
    } else {
      done([]);
    }
  });
};

interface Logger {
  log<T>(...args: T[]): void;
  debug<T>(...args: T[]): void;
  warn<T>(...args: T[]): void;
  info<T>(...args: T[]): void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error(arg: string | Error, ...data: any[]): void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function error(arg: string | Error, ...data: any[]) {
  // tslint:disable no-console
  console.error(arg);

  let err: Error;
  if (arg instanceof String) {
    err = new Error(arg as string);
  } else {
    err = arg as Error;
  }

  let mappedStack = await getMappedStack(err);
  if (!mappedStack) {
    mappedStack = [];
  }

  if (isDevelopment && !silenceAlerts) {
    const alertInfo = {
      mappedStack,
      message: err.message || arg,
      data
    };
    if (!isEmpty(alertInfo.message)) {
      alert(JSON.stringify(alertInfo));
    }
  }
}

const logger: Logger = {
  // tslint:disable no-console
  debug: console.debug,
  error,
  info: console.info,
  log: console.log,
  warn: console.warn,
};

export default logger;
