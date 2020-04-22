import React, { PropsWithChildren } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

interface ManualProps {
  style?: ViewStyle;
}

interface Props extends PropsWithChildren<ManualProps> {}

const styles = StyleSheet.create({
  row: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
});

export const Row = ({ style = {}, children }: Props) =>  (
  <View style={{ ...styles.row, ...style }}>{children}</View>
)
