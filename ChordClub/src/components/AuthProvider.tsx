import React, { createContext, PropsWithChildren } from 'react';
import auth, { AuthState, AuthActions } from '../util/auth';
import logger from '../util/logger';


export const AuthContext = createContext(auth.currentState());


export class AuthProvider extends React.Component<{}, AuthState> {
  public state: AuthState = auth.currentState();
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
        this.setState(e.state);
      },
    })
  }

  public render() {
    logger.info('AUTH STATE CHANGE', this.state);
    return (
      <AuthContext.Provider value={this.state}>
        {this.props.children}
      </AuthContext.Provider>
    );
  }
}

export interface AuthConsumerProps {
  authState: AuthState;
  authActions: AuthActions;
}

export const withAuth = <P extends {}>(Component: React.ComponentType<P & AuthConsumerProps>) => {
  return (props: PropsWithChildren<P>) => (
    <AuthContext.Consumer>
      {(value: AuthState) => (
        <Component
          authActions={auth.actions}
          authState={value}
          {...props}
        />
      )}
    </AuthContext.Consumer>
  );
};
