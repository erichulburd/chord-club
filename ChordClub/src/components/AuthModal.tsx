import React from 'react';
import {Button, Card, Modal, Text, Spinner} from '@ui-kitten/components';
import {StyleSheet, ViewProps, View, Linking} from 'react-native';
import {UserConsumerProps, withUser} from './UserContext';
import UsernameModal from './UsernameModal';
import { withApollo, WithApolloClient } from 'react-apollo';
import { TouchableOpacity } from 'react-native-gesture-handler';

const styles = StyleSheet.create({
  container: {
    minHeight: 192,
  },
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  auth0Text: {
    marginTop: 20,
    marginBottom: 10,
  }
});

interface Props extends UserConsumerProps, WithApolloClient<{}> {}

const AuthModal = ({userCtx, client}: Props) => {
  const {
    authState,
    authActions: {login},
  } = userCtx;
  const {token, sessionExpired, initialized} = authState;
  const isLoggedIn = Boolean(token);
  if (isLoggedIn) {
    return <UsernameModal />;
  }
  const onLogin = async () => {
    await login();
    await client.resetStore();
  }
  const Footer = (props?: ViewProps) => (
    <View {...props}>
      <Button status="success" onPress={onLogin} appearance="outline">
        Login or sign up
      </Button>
    </View>
  );
  return (
    <Modal visible backdropStyle={styles.backdrop}>
      <Card disabled={true} status="success" footer={Footer}>
        <Text category="h6">Chord Club</Text>
        {!initialized && <Spinner size="giant" />}
        {initialized && (
          <React.Fragment>
            {sessionExpired && (
              <Text status={'danger'}>Oops, your session has expired!</Text>
            )}
            <TouchableOpacity
              onPress={() => Linking.openURL('https://auth0.com/security/#certifications')}
            >
              <Text style={styles.auth0Text}>
                For your security and privacy, we use Auth0 for account management. Click to read more.
              </Text>
            </TouchableOpacity>

          </React.Fragment>
        )}
      </Card>
    </Modal>
  );
};

export default withUser<{}>(withApollo<UserConsumerProps>(AuthModal));
