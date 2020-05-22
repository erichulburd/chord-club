import React, { useContext } from 'react';
import { AppScreen, Screens } from './AppScreen';
import { Text, Card, Button } from '@ui-kitten/components';
import { AuthContext } from './UserContext';
import { ViewProps, View, Linking, StyleSheet } from 'react-native';
import { CenteredSpinner } from './CenteredSpinner';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { withApollo, WithApolloClient } from 'react-apollo';

interface Props extends WithApolloClient<{}> {

}

export const LoginScreen = ({ client }: Props) => {
  const userCtx = useContext(AuthContext);

  const {initialized, sessionExpired} = userCtx.authState;
  const {login} = userCtx.authActions;
  const onLogin = async () => {
    try {
      await client.resetStore();
    } finally {
      await login();
    }
  };
  const Footer = (props?: ViewProps) => (
    <View {...props}>
      <Button status="success" onPress={onLogin} appearance="outline">
        Login or sign up
      </Button>
    </View>
  );
  return (
    <AppScreen title={Screens.Login}>
      <Card disabled={true} status="success" footer={Footer}>
        <Text category="h6" style={styles.header}>Welcome to ChordClub</Text>
        {!initialized && <CenteredSpinner size="giant" />}
        {initialized && (
          <React.Fragment>
            {sessionExpired && (
              <Text status={'danger'}>Oops, your session has expired!</Text>
            )}
            <TouchableOpacity
              onPress={() =>
                Linking.openURL('https://auth0.com/security/#certifications')
              }>
              <Text style={styles.auth0Text}>
                For your security and privacy, we use Auth0 for account
                management. Click to read more.
              </Text>
            </TouchableOpacity>
          </React.Fragment>
        )}
      </Card>
    </AppScreen>
  );
};

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
  },
  header: {
    marginBottom: 10,
  }
});

export default withApollo<{}>(LoginScreen);
