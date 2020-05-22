import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Spinner} from '@ui-kitten/components';
import { Size, Status } from '../util/themeHelpers';

interface Props {
  size?: Size;
  status?: Status;
}

export const CenteredSpinner = ({size='medium', status='primary'}: Props) => (
  <View style={styles.container}>
    <Spinner size={size} status={status} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    padding: 10,
  },
});
