import React from 'react';
import {ApolloError} from 'apollo-client';
import {Modal, Card} from '@ui-kitten/components';
import ErrorText from './ErrorText';
import {StyleSheet} from 'react-native';

interface Props {
  error: ApolloError | string | undefined;
}

export const ErrorModal = ({error}: Props) => (
  <Modal visible={Boolean(error)} backdropStyle={styles.backdrop}>
    <Card status={'danger'}>{error && <ErrorText error={error} />}</Card>
  </Modal>
);

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});
