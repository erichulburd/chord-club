import Auth0 from 'react-native-auth0';
import AsyncStorage from '@react-native-community/async-storage';
import Observable from 'zen-observable';
import logger from './logger';

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
}

interface AuthEvent {
  state: AuthState;
  type: AuthEventType;
}

const authState: AuthState = {
  initialized: false,
  token: undefined,
};

const TOKEN_ASYNC_KEY = '@ChordClub:token';

export const initialize = async () => {
  try {
    const token = await AsyncStorage.getItem(TOKEN_ASYNC_KEY);
    if (token) {
      authState.token = token;
    }
  } catch (err) {
    logger.error(err);
  }
  authState.initialized = true;
  publish({ state: { ...authState }, type: AuthEventType.INITIALIZED });
};

export const sessionExpired = () => {
  authState.token = undefined;
  publish({ state: { ...authState }, type: AuthEventType.SESSION_EXPIRED });
};

export const login = async () => {
  if (Boolean(authState.token)) {
    return;
  }
  try {
    const credentials = await auth0Login();
    authState.token = credentials.accessToken;
    publish({ state: { ...authState }, type: AuthEventType.USER_LOGIN });
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
  publish({ state: { ...authState }, type: AuthEventType.USER_LOGOUT });
  auth0Logout();
  AsyncStorage.removeItem(TOKEN_ASYNC_KEY);
};

export const isAuthInitialized = (): boolean => authState.initialized;
export const isLoggedIn = (): boolean => Boolean(authState.token);
export const getToken = (): string | undefined => authState.token;

const subscribers = new Set<ZenObservable.Observer<AuthEvent>>();

const publish = (event: AuthEvent) => {
  subscribers.forEach((observer) => {
    if (observer.next) {
      observer.next(event);
    }
  });
};

export const authStateObservable = new Observable<AuthEvent>(observer => {
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
  // TODO
  domain: 'dev-a1418g8w.auth0.com',
  clientId: 'Cpx3C78jx5gtje0EzpiXjgmLWb19Mufv',
});

interface Auth0Credentials {
  accessToken: string;
}

const auth0Login = (): Promise<Auth0Credentials> => auth0.webAuth.authorize({
  scope: 'openid',
});
const auth0Logout = () => auth0.webAuth.clearSession({ federated: true });
