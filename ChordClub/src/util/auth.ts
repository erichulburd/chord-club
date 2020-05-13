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

let authState: AuthState = Object.freeze({
  initialized: false,
  token: undefined,
  sessionExpired: false,
  uid: '',
});

const TOKEN_ASYNC_KEY = '@ChordClub:token';

const initialize = async () => {
  const update = {...authState};
  try {
    const token = await AsyncStorage.getItem(TOKEN_ASYNC_KEY);
    if (token) {
      update.token = token;
      const claims = parseJWT(token);
      update.uid = claims.sub;
    }
  } catch (err) {
    logger.error(err);
  }
  update.initialized = true;
  publish({state: update, type: AuthEventType.INITIALIZED});
};

const sessionExpired = () => {
  publish({
    state: {...authState, sessionExpired: true, token: undefined},
    type: AuthEventType.SESSION_EXPIRED,
  });
};

const login = async () => {
  try {
    const credentials = await auth0Login();
    const token = credentials.accessToken;
    const claims = parseJWT(token);
    const uid = claims.sub;
    publish({
      state: {
        ...authState,
        sessionExpired: false,
        uid,
        token,
      },
      type: AuthEventType.USER_LOGIN,
    });
    AsyncStorage.setItem(TOKEN_ASYNC_KEY, token);
  } catch (err) {
    logger.error(err);
    publish({state: {...authState}, type: AuthEventType.USER_LOGIN_ERROR});
  }
};

export const logout = async () => {
  if (!authState.token) {
    return;
  }
  publish({
    state: {...authState, sessionExpired: false, token: undefined},
    type: AuthEventType.USER_LOGOUT,
  });
  // auth0Logout();
  await AsyncStorage.removeItem(TOKEN_ASYNC_KEY);
};

const subscribers = new Set<ZenObservable.Observer<AuthEvent>>();

const publish = (event: AuthEvent) => {
  authState = Object.freeze(event.state)
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
// const auth0Logout = () => auth0.webAuth.clearSession({federated: true});

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
