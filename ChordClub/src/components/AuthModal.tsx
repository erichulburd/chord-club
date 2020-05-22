import React from 'react';
import {Button, Card, Modal, Text, Spinner} from '@ui-kitten/components';
import {StyleSheet, ViewProps, View, Linking} from 'react-native';
import {UserConsumerProps, withUser} from './UserContext';
import UsernameModal from './UsernameModal';
import {withApollo, WithApolloClient} from 'react-apollo';
import {TouchableOpacity} from 'react-native-gesture-handler';

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
});

interface Props extends UserConsumerProps, WithApolloClient<{}> {}

const AuthModal = ({userCtx, client}: Props) => {
  const {
    authState,
  } = userCtx;
  const {token} = authState;
  const isLoggedIn = Boolean(token);
  if (isLoggedIn) {
    return <UsernameModal />;
  }
  return null;
};

export default withUser<{}>(withApollo<UserConsumerProps>(AuthModal));
