import React, {useContext, useEffect, useState} from 'react';
import {AudioContext} from './AudioContextProvider';
import {AudioControls, AudioAction} from './AudioControls';

interface Props {
  extraActions?: AudioAction[];
}

export const AudioPlayerActive = ({extraActions = []}: Props) => {
  const audioCtx = useContext(AudioContext);
  const [currentPositionMs, setCurrentPositionMs] = useState(0);
  const [durationMs, setDurationMs] = useState(0);
  const [started, setStarted] = useState(false);
  const [paused, setPaused] = useState(false);

  const {audioRecorderPlayer} = audioCtx;
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

  /*
  const seek = useCallback(
    () => async (positionMs: number) => {
      let newPosition = positionMs;
      newPosition = Math.min(newPosition, durationMs);
      newPosition = Math.max(newPosition, 0);
      newPosition = Math.round(newPosition);

      try {
        await audioRecorderPlayer.seekToPlayer(newPosition);
      } catch (err) {
        logger.error('seek failed', err);
      }
    },
    [durationMs],
  );
  */
  const stop = async () => {
    setPaused(false);
    setDurationMs(0);
    setPaused(false);
    await audioCtx.stopPlay();
  };
  const onPress = paused ? resume : pause;
  const iconName = paused ? 'play-circle' : 'pause-circle';
  const actions: AudioAction[] = [
    {onPress: stop, iconName: 'step-backward'},
    {onPress, iconName},
    ...extraActions,
  ];
  return (
    <AudioControls
      seek={undefined}
      currentPositionMs={currentPositionMs}
      durationMs={durationMs}
      actions={actions}
    />
  );
};

