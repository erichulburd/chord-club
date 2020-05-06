import React from 'react';
import {ApolloError} from 'apollo-client';
import {Text, Button, Icon} from '@ui-kitten/components';
import {View, StyleSheet} from 'react-native';
import {ErrorType} from '../types';

interface ErrorTextProps {
  error: ApolloError | string;
  retry?: () => void;
}

const defaultServerMessage =
  'We experienced an unexpected issue on our server.';

const unhandledErrors = new Set([
  ErrorType.Unhandled,
  ErrorType.InternalServerError,
]);

const getErrorText = (error: ApolloError | string) => {
  if (error instanceof ApolloError) {
    return error.graphQLErrors
      .map((err) => {
        const code = err.extensions?.code;
        if (!code || unhandledErrors.has(code)) {
          return defaultServerMessage;
        }
        return err.message;
      })
      .join(' ');
  }
  return error;
};

export default ({error, retry}: ErrorTextProps) => (
  <View style={styles.container}>
    <Text category={'danger'}>{getErrorText(error)}</Text>
    {retry && (
      <Button
        appearance="outline"
        size="small"
        accessoryLeft={(props) => <Icon name="redo" {...props} /> }
      >Retry</Button>
    )}
  </View>
);

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
});
