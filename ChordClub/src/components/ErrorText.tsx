import React from 'react';
import { ApolloError } from 'apollo-client';
import { Text, Button, Icon } from '@ui-kitten/components';
import { View } from 'react-native';

interface ErrorTextProps {
  error: ApolloError;
  retry?: () => void;
}




export default ({ error, retry }: ErrorTextProps) => (
  <View>
    <Text category={'danger'}>
      There was an processing the request. Please try again.
    </Text>
    {retry &&
      <Button
        appearance='outline'
        accessoryLeft={(props) => <Icon name='redo' {...props} /> }
      />
    }
  </View>
);
