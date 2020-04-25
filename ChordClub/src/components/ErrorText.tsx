import React from 'react';
import { ApolloError } from 'apollo-client';
import { Text, Button, Icon } from '@ui-kitten/components';
import { View } from 'react-native';
import { ErrorType } from '../types';

interface ErrorTextProps {
  error: ApolloError | string;
  retry?: () => void;
}

const defaultServerMessage = 'We experienced an unexpected issue on our server.';

const getErrorText = (error: ApolloError | string) => {
  if (error instanceof ApolloError) {
    return error.graphQLErrors.map((err) => {
      const code = err.extensions?.code;
      if (!code || code === ErrorType.Unhandled) {
        return defaultServerMessage;
      }
      return err.message;
    }).join(' ');
  }
  return error;
};

export default ({ error, retry }: ErrorTextProps) => (
  <View>
    <Text category={'danger'}>
      {getErrorText(error)}
    </Text>
    {retry &&
      <Button
        appearance='outline'
        accessoryLeft={(props) => <Icon name='redo' {...props} /> }
      />
    }
  </View>
);
