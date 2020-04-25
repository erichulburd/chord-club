import React from 'react';
import { Modal, Spinner } from '@ui-kitten/components';
import { StyleSheet } from 'react-native';

interface Props {
  visible: boolean;
}

export const WaitModal = ({ visible }: Props) => (
  <Modal
    visible={visible}
    backdropStyle={styles.backdrop}
  >
    <Spinner />
  </Modal>
)

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});
