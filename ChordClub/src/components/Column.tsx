import React, {PropsWithChildren} from 'react';
import {View, StyleSheet, StyleProp, ViewStyle} from 'react-native';

interface Props {
  style?: StyleProp<ViewStyle>;
}

export const Column = ({children, style = {}}: PropsWithChildren<Props>) => {
  return <View style={[styles.column, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  column: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
