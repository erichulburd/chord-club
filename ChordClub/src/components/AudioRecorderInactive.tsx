import React, { useContext } from 'react';
import { Audioable } from '../util/audio';
import { AudioContext } from './AudioContextProvider';
import { Button } from '@ui-kitten/components';
import { View } from 'react-native';
import { ThemedIcon } from './FontAwesomeIcons';
import { AudioPlayer } from './AudioPlayer';
import { AudioAction, AudioControls } from './AudioControls';

interface Props {
  audio?: Audioable;
  recorderID: string;
  resetRecording: () => void;
}

export const AudioRecorderInactive = ({
  audio, resetRecording, recorderID,
}: Props) => {
  const audioCtx = useContext(AudioContext);
  const record = async () => {
    await audioCtx.startRecord(recorderID);
  }
  if (audio) {
    return (<AudioPlayer audio={audio} />);
  }
  const actions: AudioAction[] = [
    { iconName: 'stop' },
    { iconName: 'circle', status: 'danger', onPress: record },
  ];
  return (
    <AudioControls
      currentPositionMs={0}
      durationMs={0}
      actions={actions}
    />
  );
};
