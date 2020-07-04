import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Text} from '@ui-kitten/components';
import {pad} from '../util/strings';

interface Props {
  currentPositionMs?: number;
  durationMs: number;
}

export const formatMs = (ms: number) => {
  const s = Math.ceil(ms / 1000);
  const minutes = Math.floor(s / 60);
  const seconds = s % 60;
  return `${pad(minutes.toString(), 2)}:${pad(seconds.toString(), 2)}`;
};

export const AudioDuration = ({currentPositionMs, durationMs}: Props) => (
  <View style={styles.playTimeAndDuration}>
    {Boolean(currentPositionMs) && (
      <>
        <View style={styles.elapsed1}>
          <Text>{formatMs(currentPositionMs || 0)}</Text>
        </View>
        <Text>/</Text>
      </>
    )}
    <View style={styles.elapsed2}>
      <Text>{formatMs(durationMs)}</Text>
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
