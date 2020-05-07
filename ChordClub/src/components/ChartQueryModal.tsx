import React from 'react';
import {StyleSheet} from 'react-native';
import {ChartQuery} from '../types';
import ChartQueryEditor from './ChartQueryEditor';
import {Modal} from '@ui-kitten/components';

interface Props {
  query: ChartQuery;
  save: (query: ChartQuery) => void;
  close: () => void;
  isOpen: boolean;
}

export const ChartQueryModal = ({isOpen, query, save, close}: Props) => {
  return (
    <Modal
      visible={isOpen}
      backdropStyle={styles.backdrop}
      style={styles.modal}>
      <ChartQueryEditor initialQuery={query} save={save} cancel={close} />
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modal: {width: '100%', maxWidth: 600},
});
