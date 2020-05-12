import Auth0 from 'react-native-auth0';
import AsyncStorage from '@react-native-community/async-storage';
import Observable from 'zen-observable';
import logger from './logger';
import {Buffer} from 'buffer';
import {ObservableState} from './observableState';
import config from './config';

export enum AuthEventType {
  INITIALIZED,
  SUBSCRIBED,
  USER_LOGIN,
  USER_LOGIN_ERROR,
  USER_LOGOUT,
  SESSION_EXPIRED,
}

export interface AuthState {
  initialized: boolean;
  token: string | undefined;
  sessionExpired: boolean;
  uid: string;
}

interface AuthEvent {
  state: AuthState;
  type: AuthEventType;
}

const authState: AuthState = {
  initialized: false,
  token: undefined,
  sessionExpired: false,
  uid: '',
};

const TOKEN_ASYNC_KEY = '@ChordClub:token';

const initialize = async () => {
  try {
    const token = await AsyncStorage.getItem(TOKEN_ASYNC_KEY);
    if (token) {
      authState.token = token;
      const claims = parseJWT(token);
      authState.uid = claims.sub;
    }
  } catch (err) {
    logger.error(err);
  }
  authState.initialized = true;
  publish({state: {...authState}, type: AuthEventType.INITIALIZED});
};

const sessionExpired = () => {
  authState.token = undefined;
  publish({
    state: {sessionExpired: true, ...authState},
    type: AuthEventType.SESSION_EXPIRED,
  });
};

const login = async () => {
  if (authState.token) {
    return;
  }
  try {
    const credentials = await auth0Login();
    authState.token = credentials.accessToken;
    const claims = parseJWT(authState.token);
    authState.uid = claims.sub;
    publish({
      state: {sessionExpired: false, ...authState},
      type: AuthEventType.USER_LOGIN,
    });
    AsyncStorage.setItem(TOKEN_ASYNC_KEY, authState.token);
  } catch (err) {
    logger.error(err);
    publish({state: {...authState}, type: AuthEventType.USER_LOGIN_ERROR});
  }
};

export const logout = async () => {
  if (!authState.token) {
    return;
  }
  authState.token = undefined;
  publish({
    state: {sessionExpired: false, ...authState},
    type: AuthEventType.USER_LOGOUT,
  });
  auth0Logout();
  AsyncStorage.removeItem(TOKEN_ASYNC_KEY);
};

const subscribers = new Set<ZenObservable.Observer<AuthEvent>>();

const publish = (event: AuthEvent) => {
  subscribers.forEach((observer) => {
    if (observer.next) {
      observer.next(event);
    }
  });
};

export const observable = new Observable<AuthEvent>((observer) => {
  subscribers.add(observer);
  observer.next({
    type: AuthEventType.SUBSCRIBED,
    state: authState,
  });
  return () => {
    subscribers.delete(observer);
  };
});

const auth0 = new Auth0({
  domain: config.AUTH0_DOMAIN,
  clientId: config.AUTH0_CLIENT_ID,
});

interface Auth0Credentials {
  accessToken: string;
  idToken: string;
}

const auth0Login = (): Promise<Auth0Credentials> =>
  auth0.webAuth.authorize({
    scope: 'openid',
    audience: config.AUTH0_TOKEN_AUDIENCE,
  });
const auth0Logout = () => auth0.webAuth.clearSession({federated: true});

export interface AuthActions {
  login: () => Promise<void>;
  logout: () => Promise<void>;
  initialize: () => void;
  sessionExpired: () => void;
}

const observableState: ObservableState<AuthActions, AuthState, AuthEvent> = {
  observable,
  currentState: () => authState,
  actions: {
    login,
    logout,
    initialize,
    sessionExpired,
  },
};

const parseJWT = (token: string) => {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace('-', '+').replace('_', '/');
  return JSON.parse(Buffer.from(base64, 'base64').toString('utf-8'));
};

export default observableState;
