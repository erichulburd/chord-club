import React, { useContext, useEffect, useState } from 'react';
import { Audioable } from '../util/audio';
import { AudioPlayingContext } from './AudioContexts';
import { View, StyleSheet } from 'react-native';
import { getCalRatio } from 'src/util/screen';
import { Button } from '@ui-kitten/components';
import { AudioPlayerProgress } from './AudioPlayerProgress';
import { ThemedIcon } from './FontAwesomeIcons';

interface Props {
  audio: Audioable;
}

interface State {
  started: boolean;
}

export const AudioPlayerActive = () => {
  const audioCtx = useContext(AudioPlayingContext);
  const [state, setState] = useState({ started: false });
  useEffect(() => {
    if (!state.started) {
      setState({ started: true });
      audioCtx.start();
    }
  })
  const { pause, resume, paused, seek, stop} = audioCtx
  const onPress = paused ? resume : pause;
  const iconName = paused ? 'play-circle' : 'pause-circle';
  return (
    <View style={styles.container}>
      <View style={styles.innerContainer}>
        <Button
          appearance="ghost"
          status="success"
          size="small"
          accessoryLeft={ThemedIcon(iconName)}
          onPress={onPress}
        />
        <AudioPlayerProgress
          seek={seek}
          playPosition={audioCtx.currentPositionSec}
          playDuration={audioCtx.currentDurationSec}
        />
      </View>
    </View>
  );
}

const initialDims = getCalRatio();
const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  innerContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewBar: {
    height: 20 * initialDims.ratio,
  },
  viewBarPlay: {
    height: 20 * initialDims.ratio,
    width: 0,
  },
});
