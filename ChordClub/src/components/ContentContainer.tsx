import React, { PropsWithChildren } from 'react';
import { View, StyleSheet } from 'react-native';

export const ContentContainer = ({ children}: PropsWithChildren<{}>) => (
  <View style={styles.contentContainer}>
    <View style={styles.contentInner}>
      {children}
    </View>
  </View>
);

const styles = StyleSheet.create({
  contentContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    flex: 1,
  },
  contentInner: {
    flex: 1,
    maxWidth: 500,
    margin: 5,
  }
})
