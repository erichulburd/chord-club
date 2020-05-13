import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@ui-kitten/components';

interface Props {
  playTime: string;
  duration: string;
}

export const PlayTimeAndDuration = ({
  playTime,
  duration,
}: Props) => (
  <View style={styles.playTimeAndDuration}>
    <View style={styles.elapsed1}>
      <Text>{playTime}</Text>
    </View>
    <Text>/</Text>
    <View style={styles.elapsed2}>
      <Text>{duration}</Text>
    </View>
  </View>
);

const styles: any = StyleSheet.create({
  playTimeAndDuration: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
