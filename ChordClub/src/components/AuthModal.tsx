import React from 'react';
import { Button, Card, Modal, Text, Spinner } from '@ui-kitten/components';
import { StyleSheet } from 'react-native';
import {
  initialize,
  authStateObservable,
  AuthEventType,
  AuthState,
  login,
} from '../util/auth';


const styles = StyleSheet.create({
  container: {
    minHeight: 192,
  },
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});

interface State {
  authState?: AuthState;
  sessionExpired: boolean
}

export class Auth extends React.Component<{}, State> {
  public state: State = {
    sessionExpired: false
  };
  private subscription?: ZenObservable.Subscription;

  componentDidMount() {
    this._initializeAuth();
  }

  componentWillMount() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private async _initializeAuth() {
    await initialize();
    this.subscription = authStateObservable.subscribe({
      next: (e) => {

        this.setState({
          authState: e.state,
          sessionExpired: e.type === AuthEventType.SESSION_EXPIRED
        });
      },
    })
  }

  public render() {
    const { authState, sessionExpired } = this.state;
    const isLoggedIn = Boolean(authState?.token);
    if (isLoggedIn) {
      return null;
    }
    const isInitialized = authState?.initialized;

    return (
      <Modal
        visible
        backdropStyle={styles.backdrop}
      >
        <Card disabled={true}>
          <Text>Chord Club</Text>
          {!isInitialized &&
            <Spinner size='giant'/>
          }
          {isInitialized &&
            <React.Fragment>
              {sessionExpired &&
                <Text status={'danger'}>
                  Oops, your session has expired!
                </Text>
              }
              <Button onPress={login}>
                Login or sign up
              </Button>
            </React.Fragment>
          }
        </Card>
      </Modal>
    );
  }
}
