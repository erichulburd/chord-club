import React, { useContext, useEffect, useState, useCallback } from 'react';
import { AudioContext } from './AudioContextProvider';
import { StyleSheet } from 'react-native';
import { getCalRatio } from '../util/screen';
import { AudioControls, AudioAction } from './AudioControls';
import logger from '../util/logger';


export const AudioPlayerActive = () => {
  const audioCtx = useContext(AudioContext);
  const [currentPositionMs, setCurrentPositionMs] = useState(0);
  const [durationMs, setDurationMs] = useState(0);
  const [started, setStarted] = useState(false);
  const [paused, setPaused] = useState(false);

  const { audioRecorderPlayer } = audioCtx;
  const start = async () => {
    if (!audioCtx.focusedAudioURL || started) {
      return;
    }
    setStarted(true);
    await audioRecorderPlayer.startPlayer(audioCtx.focusedAudioURL);
    await audioRecorderPlayer.setVolume(1.0);

    audioRecorderPlayer.addPlayBackListener(async (e: any) => {
      const newPositionMs = parseFloat(e.current_position);
      const newDurationMs = parseFloat(e.duration);
      if (newPositionMs >= newDurationMs) {
        await audioCtx.stopPlay();
      } else {
        setCurrentPositionMs(newPositionMs);
        setDurationMs(newDurationMs);
      }
    });
  };
  useEffect(() => {
    if (!started) {
      start();
    }
  }, [started]);

  const pause = async () => {
    await audioRecorderPlayer.pausePlayer();
    setPaused(true);
  };
  const resume = async () => {
    await audioRecorderPlayer.resumePlayer();
    setPaused(false);
  };

  const seek = useCallback(() => async (positionMs: number) => {
    let newPosition = positionMs;
    newPosition = Math.min(newPosition, durationMs);
    newPosition = Math.max(newPosition, 0);
    newPosition = Math.round(newPosition);

    try {
      await audioRecorderPlayer.seekToPlayer(newPosition);
    } catch(err) {
      logger.error('seek failed', err);
    }
  }, [durationMs]);
  const stop = async () => {
    setPaused(false);
    setDurationMs(0);
    setPaused(false);
    await audioCtx.stopPlay()
  }
  const onPress = paused ? resume : pause;
  const iconName = paused ? 'play-circle' : 'pause-circle';
  const actions: AudioAction[] = [
    { onPress: stop, iconName: 'step-backward', status: 'basic' },
    { onPress, iconName, status: 'basic' }
  ];
  return (
    <AudioControls
      seek={seek}
      currentPositionMs={currentPositionMs}
      durationMs={durationMs}
      actions={actions}
    />
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
});
