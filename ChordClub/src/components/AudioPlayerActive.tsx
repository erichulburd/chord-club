import React, { useContext, useEffect, useState } from 'react';
import { Audioable } from '../util/audio';
import { AudioContext } from './AudioContextProvider';
import { StyleSheet } from 'react-native';
import { getCalRatio } from '../util/screen';
import { Button } from '@ui-kitten/components';
import { AudioControls, AudioAction } from './AudioControls';
import { ThemedIcon } from './FontAwesomeIcons';
import logger from '../util/logger';

interface Props {
  audio: Audioable;
}

interface State {
  currentPositionMs: number;
  durationMs: number;
  paused: boolean;
  started: boolean;
}

export const AudioPlayerActive = () => {
  const audioCtx = useContext(AudioContext);
  const [state, setState] = useState<State>({
    currentPositionMs: 0,
    durationMs: 0,
    paused: false,
    started: false,
  });
  const { audioRecorderPlayer } = audioCtx;
  const start = async () => {
    if (!audioCtx.focusedAudioURL || state.started) {
      return;
    }
    await audioRecorderPlayer.startPlayer(audioCtx.focusedAudioURL);
    await audioRecorderPlayer.setVolume(1.0);

    audioRecorderPlayer.addPlayBackListener(async (e: any) => {
      const currentPositionMs = parseFloat(e.current_position);
      const durationMs = parseFloat(e.duration);
      if (currentPositionMs >= durationMs) {
        await audioCtx.stopPlay();
      } else {
        setState({
          ...state,
          started: true,
          currentPositionMs,
          durationMs,
        });
      }
    });
  };
  useEffect(() => {
    if (!state.started) {
      setState({ ...state, started: true });
      start();
    }
  });

  const pause = async () => {
    await audioRecorderPlayer.pausePlayer();
    setState({...state, paused: true});
  };
  const resume = async () => {
    await audioRecorderPlayer.resumePlayer();
    setState({...state, paused: false});
  };

  const seek = async (positionMs: number) => {
    const { durationMs } = state;
    let newPosition = positionMs;
    newPosition = Math.min(newPosition, durationMs);
    newPosition = Math.max(newPosition, 0);
    newPosition = Math.round(newPosition);

    try {
      await audioRecorderPlayer.seekToPlayer(newPosition);
    } catch(err) {
      logger.error('seek failed', err);
    }
  }
  const stop = async () => {
    setState({
      ...state,
      currentPositionMs: 0,
      durationMs: 0,
      paused: false,
    });
    await audioCtx.stopPlay()
  }
  const { paused, currentPositionMs, durationMs } = state;
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
