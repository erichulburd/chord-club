import React, {useContext} from 'react';
import {Audioable} from '../util/audio';
import {AudioContext} from './AudioContextProvider';
import {AudioControls, AudioAction} from './AudioControls';

interface Props {
  audio: Audioable;
  extraActions?: AudioAction[];
}

export const AudioPlayerInactive = ({audio, extraActions = []}: Props) => {
  const audioCtx = useContext(AudioContext);
  const actions: AudioAction[] = [
    {iconName: 'step-backward', status: 'basic'},
    {
      onPress: () => audioCtx.startPlay(audio),
      iconName: 'play-circle',
      status: 'success',
    },
    ...extraActions,
  ];
  return (
    <AudioControls
      currentPositionMs={0}
      durationMs={audio.audioLength}
      actions={actions}
    />
  );
};
