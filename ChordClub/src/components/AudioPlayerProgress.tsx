import React from 'react';
import { View, StyleSheet, GestureResponderEvent } from 'react-native';
import { getCalRatio } from '../util/screen';
import { getColors } from './audioPlayerStyles';
import { useTheme } from '@react-navigation/native';

interface Props {
  playPosition: number;
  playDuration: number;
  width: number;
  seek?: (positionMs: number) => void;
}

const dims = getCalRatio();

export const AudioPlayerProgress = ({
  playPosition, playDuration, seek, width
}: Props) => {
  const onSeek = (seek === undefined ? undefined : (e: GestureResponderEvent) => {
    const ratio = width ? (e.nativeEvent.locationX  / width) : 0;
    seek(playDuration * ratio);
  });
  const eva = useTheme();
  const colors = getColors(eva.colors);
  const ratio = playDuration ? (playPosition / playDuration) : 0;
  const playWidth = width === undefined ? undefined : width * ratio;
  return (
    <View
      onTouchEndCapture={onSeek}
    >
      <View
        style={[
          styles.viewBar,
          {width, backgroundColor: colors.lighter},
        ]}>
        <View
          style={[
            styles.viewBarPlay,
            {width: playWidth, backgroundColor: colors.played},
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  viewBar: {
    height: 10 * dims.ratio,
  },
  viewBarPlay: {
    height: 10 * dims.ratio,
  },
});
