import React from 'react';
import { Button, Card, Modal, Text, Spinner } from '@ui-kitten/components';
import { StyleSheet, ViewProps, View } from 'react-native';
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
  const Footer = (props?: ViewProps) => (
    <View {...props}>
      <Button status="success" onPress={login} appearance="outline">
        Login or sign up
      </Button>
    </View>
  );
  return (
    <Modal
      visible
      backdropStyle={styles.backdrop}
    >
      <Card disabled={true} status="success" footer={Footer}>
        <Text category="h6">Chord Club</Text>
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
            <Text>For your security and privacy, we use Auth0 to manage our user accounts.</Text>
          </React.Fragment>
        }
      </Card>
    </Modal>
  );
};

export default withAuth<{}>(AuthModal);
