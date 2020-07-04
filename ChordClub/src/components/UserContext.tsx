import React, {createContext, PropsWithChildren} from 'react';
import auth, {AuthState, AuthActions, AuthEventType} from '../util/auth';
import {
  User,
  ChartQuery,
  UserUpdate,
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
import {
  UserSettings,
  SettingsPath,
  ChartViewSetting,
} from '../util/settings';
import logger from '../util/logger';
import {GraphQLError} from 'graphql';

interface Props extends WithApolloClient<{}> {}

export interface UserContextState {
  renderIndex: number;
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
  updateSettings: (
    settingsPath: SettingsPath,
    update: Partial<ChartViewSetting> | Partial<FlashcardViewSetting>,
  ) => void;
  updateChartQuery: (settingsPath: SettingsPath, update: ChartQuery) => void;
  updateCompact: (settingsPath: SettingsPath, compact: boolean) => void;
  updateUsername: (username: string) => void;
  getUID: () => string;
}

const userContextInitializedError = () =>
  new Error('User context not initialized');

const initialState = {
  renderIndex: 0,
  authState: auth.currentState(),
  authActions: auth.actions,
  user: undefined,
  userLoading: false,
  userUpdateLoading: false,
};

export const AuthContext = createContext<UserContextValue>({
  ...initialState,
  updateUser: userContextInitializedError,
  updateSettings: userContextInitializedError,
  updateChartQuery: userContextInitializedError,
  updateCompact: userContextInitializedError,
  updateUsername: userContextInitializedError,
  getUID: () => auth.currentState().uid,
});

const coalesceUserAndUpdate = (
  user: User | undefined,
  update: Partial<UserUpdate>,
): UserUpdate => {
  return {
    ...(omit(pickBy(user || {}), [
      '__typename',
      'uid',
      'createdAt',
    ]) as UserUpdate),
    ...update,
  };
};

const ensureDefaultChartViewSettings = (user: User): UserSettings => {
  const {uid} = user;
  const settings: UserSettings = {...user.settings};
  if (!settings.progressions) {
    settings.progressions = {
      query: {
        chartTypes: [ChartType.Progression],
      },
      compact: false,
    };
  } else {
    delete settings.progressions.query['scopes'];
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
        const isLoggedIn = Boolean(e.state.token);
        if (
          isLoggedIn &&
          !this.state.user &&
          !this.state.userLoading
        ) {
          this.setState({
            authState: e.state,
          }, this.loadUser);
        } else if ([AuthEventType.USER_LOGOUT, AuthEventType.SESSION_EXPIRED].indexOf(e.type) >= 0) {
          this.setState({
            authState: e.state,
            user: undefined,
          });
        } else {
          this.setState({
            authState: e.state,
          });
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
    update.renderIndex = this.state.renderIndex + 1;
    this.setState(update as UserContextState);
  };

  private updateUser = async (update: Partial<UserUpdate>) => {
    const {client} = this.props;
    const {user} = this.state;
    this.setState({userUpdateLoading: true, userUpdateError: undefined});
    try {
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
          user: data?.updateUser || user,
          userUpdateLoading: false,
        });
      }
    } catch (err) {
      logger.error(err);
      let userUpdateError = new ApolloError({
        errorMessage: 'User update failed',
        extraInfo: {},
      });
      if (err instanceof GraphQLError) {
        userUpdateError = new ApolloError({
          graphQLErrors: [err],
          extraInfo: {},
        });
      } else if (err instanceof ApolloError) {
        userUpdateError = err;
      }

      this.setState({
        userUpdateError,
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

  private updateSettings = async (
    settingsPath: SettingsPath,
    update: Partial<ChartViewSetting>,
  ) => {
    const settings = this.state.user?.settings || {};
    settings[settingsPath] = {...(settings[settingsPath] || {}), ...update};
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
      updateSettings: this.updateSettings,
      updateUsername: this.updateUsername,
      updateChartQuery: this.updateChartQuery,
      updateCompact: this.updateCompact,
      getUID: () => this.state.authState.uid || auth.currentState().uid,
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
