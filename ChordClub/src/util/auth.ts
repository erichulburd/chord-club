import Auth0 from 'react-native-auth0';
import AsyncStorage from '@react-native-community/async-storage';
import Observable from 'zen-observable';
import logger from './logger';
import { ObservableState } from './observableState';

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
}

interface AuthEvent {
  state: AuthState;
  type: AuthEventType;
}

const authState: AuthState = {
  initialized: false,
  token: undefined,
  sessionExpired: false,
};

const TOKEN_ASYNC_KEY = '@ChordClub:token';

const initialize = async () => {
  try {
    const token = await AsyncStorage.getItem(TOKEN_ASYNC_KEY);
    logger.info('TOKEN', token);
    if (token) {
      authState.token = token;
    }
  } catch (err) {
    logger.error(err);
  }
  authState.initialized = true;
  publish({ state: { ...authState }, type: AuthEventType.INITIALIZED });
};

const sessionExpired = () => {
  authState.token = undefined;
  publish({
    state: { sessionExpired: true, ...authState },
    type: AuthEventType.SESSION_EXPIRED });
};

const login = async () => {
  if (Boolean(authState.token)) {
    return;
  }
  try {
    const credentials = await auth0Login();
    authState.token = credentials.accessToken;
    logger.info('CREDENTIALS', JSON.stringify(credentials))
    publish({ state: { sessionExpired: false, ...authState }, type: AuthEventType.USER_LOGIN });
    AsyncStorage.setItem(TOKEN_ASYNC_KEY, authState.token);
  } catch (err) {
    logger.error(err);
    publish({ state: { ...authState }, type: AuthEventType.USER_LOGIN_ERROR });
  }
};

export const logout = async () => {
  if (!Boolean(authState.token)) {
    return;
  }
  authState.token = undefined;
  publish({ state: { sessionExpired: false, ...authState }, type: AuthEventType.USER_LOGOUT });
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

export const observable = new Observable<AuthEvent>(observer => {
  observer.next({
    type: AuthEventType.SUBSCRIBED,
    state: authState,
  });
  subscribers.add(observer);
  return () => {
    subscribers.delete(observer);
  };
});

const auth0 = new Auth0({
  // TODO read these from config
  domain: 'dev-a1418g8w.auth0.com',
  clientId: 'Cpx3C78jx5gtje0EzpiXjgmLWb19Mufv',
});

interface Auth0Credentials {
  accessToken: string;
  idToken: string;
}

const auth0Login = (): Promise<Auth0Credentials> => auth0.webAuth.authorize({
  scope: 'openid',
  audience: 'https://api.chordclub.app',
});
const auth0Logout = () => auth0.webAuth.clearSession({ federated: true });

export interface AuthActions {
  login: () => void;
  logout: () => void;
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
  }
};

export default observableState
