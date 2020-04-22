import React from 'react';
import { Button, Card, Modal, Text, Spinner } from '@ui-kitten/components';
import { StyleSheet } from 'react-native';
import { AuthConsumerProps, withAuth } from './AuthProvider';
import UsernameModal from './UsernameModal';

const styles = StyleSheet.create({
  container: {
    minHeight: 192,
  },
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});


const AuthModal = ({ authState, authActions: { login } }: AuthConsumerProps) => {
  const { token, sessionExpired, initialized } = authState;
  const isLoggedIn = Boolean(token);
  if (isLoggedIn) {
    return <UsernameModal />;
  }
  return (
    <Modal
      visible
      backdropStyle={styles.backdrop}
    >
      <Card disabled={true}>
        <Text>Chord Club</Text>
        {!initialized &&
          <Spinner size='giant'/>
        }
        {initialized &&
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
};

export default withAuth<{}>(AuthModal);
