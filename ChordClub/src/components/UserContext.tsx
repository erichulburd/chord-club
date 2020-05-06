import React, {createContext, PropsWithChildren} from 'react';
import auth, {AuthState, AuthActions, AuthEventType} from '../util/auth';
import {
  User,
  ChartQuery,
  UserUpdate,
  UserSettings,
  ChartViewSetting,
  BaseScopes,
  ChartType,
} from '../types';
import {WithApolloClient, withApollo} from 'react-apollo';
import {ApolloError} from 'apollo-client';
import {
  GET_ME,
  GetMeData,
  UPDATE_USER,
  UpdateUserResponse,
  UpdateUserVariables,
} from '../gql/user';
import omit from 'lodash/omit';
import pickBy from 'lodash/pickBy';
import get from 'lodash/get';

interface Props extends WithApolloClient<{}> {}

export type SettingsPath = Exclude<keyof UserSettings, '__typename'>;

export interface UserContextState {
  authState: AuthState;
  authActions: AuthActions;
  user?: User;
  userLoading: boolean;
  userError?: ApolloError;
  userUpdateError?: ApolloError;
  userUpdateLoading: boolean;
}

export interface UserContextValue extends UserContextState {
  updateUser: (update: Partial<User>) => void;
  updateChartQuery: (settingsPath: SettingsPath, update: ChartQuery) => void;
  updateCompact: (settingsPath: SettingsPath, compact: boolean) => void;
  updateUsername: (username: string) => void;
}

const userContextInitializedError = () =>
  new Error('User context not initialized');

const initialState = {
  authState: auth.currentState(),
  authActions: auth.actions,
  user: undefined,
  userLoading: false,
  userUpdateLoading: false,
};

export const AuthContext = createContext<UserContextValue>({
  ...initialState,
  updateUser: userContextInitializedError,
  updateChartQuery: userContextInitializedError,
  updateCompact: userContextInitializedError,
  updateUsername: userContextInitializedError,
});

const coalesceUserAndUpdate = (
  user: User | undefined,
  update: Partial<UserUpdate>,
): UserUpdate => {
  const coalesced = {
    ...(omit(pickBy(user || {}), [
      '__typename',
      'uid',
      'created',
      'settings',
    ]) as UserUpdate),
    ...update,
  };
  // Clean settings of __typenames
  const userSettings = coalesced.settings || {};
  if (userSettings) {
    delete (userSettings as UserSettings).__typename;
    ['chords', 'progressions', 'flashcards'].forEach((settingPath) => {
      const setting = get(userSettings, settingPath) as ChartViewSetting;
      if (setting) {
        delete setting.__typename;
      }
      if (setting.query) {
        delete setting.query.__typename;
      }
    });
  }
  return coalesced;
};

const ensureDefaultChartViewSettings = (user: User): UserSettings => {
  const {uid} = user;
  const settings = {...user.settings};
  const defaultScopes = uid ? [BaseScopes.Public, uid] : [BaseScopes.Public];
  if (!settings.chords) {
    settings.chords = {
      query: {
        scopes: defaultScopes,
        chartTypes: [ChartType.Chord],
      },
      compact: false,
    };
  }
  if (!settings.progressions) {
    settings.progressions = {
      query: {
        scopes: defaultScopes,
        chartTypes: [ChartType.Progression],
      },
      compact: true,
    };
  }
  if (!settings.flashcards) {
    settings.flashcards = {
      query: {
        scopes: defaultScopes,
        chartTypes: [ChartType.Chord],
      },
      compact: false,
    };
  }
  return settings;
};

class UserProviderComponent extends React.Component<Props, UserContextState> {
  public state: UserContextState = initialState;
  private subscription?: ZenObservable.Subscription;

  componentDidMount() {
    this._initializeAuth();
  }

  componentWillUnmount() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private async _initializeAuth() {
    await auth.actions.initialize();
    this.subscription = auth.observable.subscribe({
      next: (e) => {
        this.setState({authState: e.state});
        if (
          Boolean(e.state.token) &&
          !this.state.user &&
          !this.state.userLoading
        ) {
          this.loadUser();
        }
      },
    });
  }

  private loadUser = async () => {
    const {client} = this.props;
    const {data, errors} = await client.query<GetMeData>({
      query: GET_ME,
    });
    const user = data.me;
    user.settings = ensureDefaultChartViewSettings(user);
    const update: Partial<UserContextState> = {user: data.me};
    if (errors && errors.length > 0) {
      update.userError = new ApolloError({graphQLErrors: errors});
    }
    this.setState(update as UserContextState);
  };

  private updateUser = async (update: Partial<UserUpdate>) => {
    const {client} = this.props;
    const {user} = this.state;
    this.setState({userUpdateLoading: true});
    const {data, errors} = await client.mutate<
      UpdateUserResponse,
      UpdateUserVariables
    >({
      mutation: UPDATE_USER,
      variables: {
        userUpdate: coalesceUserAndUpdate(user, update),
      },
    });
    if (errors && errors.length > 0) {
      this.setState({
        userUpdateError: new ApolloError({graphQLErrors: errors}),
        userUpdateLoading: false,
      });
    } else {
      this.setState({
        user: data?.userUpdate || user,
        userUpdateLoading: false,
      });
    }
  };

  private updateChartQuery = async (
    settingsPath: SettingsPath,
    query: ChartQuery,
  ) => {
    const settings = this.state.user?.settings || {};
    settings[settingsPath] = {...(settings[settingsPath] || {}), query};
    this.updateUser({settings});
  };

  private updateCompact = async (
    settingsPath: SettingsPath,
    compact: boolean,
  ) => {
    const settings = this.state.user?.settings || {};
    const chartViewSetting = (settings[settingsPath] || {}) as ChartViewSetting;
    settings[settingsPath] = {...chartViewSetting, compact};
    this.updateUser({settings});
  };

  private updateUsername = async (username: string) => {
    this.updateUser({
      username,
    });
  };

  public render() {
    const value = {
      ...this.state,
      updateUser: this.updateUser,
      updateUsername: this.updateUsername,
      updateChartQuery: this.updateChartQuery,
      updateCompact: this.updateCompact,
    };
    return (
      <AuthContext.Provider value={value}>
        {this.props.children}
      </AuthContext.Provider>
    );
  }
}

export const UserProvider = withApollo<{}>(UserProviderComponent);

export interface UserConsumerProps {
  userCtx: UserContextValue;
}

export const withUser = <P extends {}>(
  Component: React.ComponentType<P & UserConsumerProps>,
) => {
  return (props: PropsWithChildren<P>) => (
    <AuthContext.Consumer>
      {(value: UserContextValue) => <Component userCtx={value} {...props} />}
    </AuthContext.Consumer>
  );
};
