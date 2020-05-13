import React, { useContext } from 'react';
import { Audioable } from '../util/audio';
import { AudioContext } from './AudioContextProvider';
import { Button } from '@ui-kitten/components';
import { ThemedIcon } from './FontAwesomeIcons';
import { AudioControls, AudioAction } from './AudioControls';

interface Props {
  audio: Audioable;
}

export const AudioPlayerInactive = ({
  audio,
}: Props) => {
  const audioCtx = useContext(AudioContext);
  const actions: AudioAction[] = [
    { iconName: 'step-backward', status: 'basic' },
    { onPress: () => audioCtx.startPlay(audio), iconName: 'play-circle', status: 'success' }
  ];
  return (
    <AudioControls
      currentPositionMs={0}
      durationMs={audio.audioLength}
      actions={actions}
    />
  );
};
