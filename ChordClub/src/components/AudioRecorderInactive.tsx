import React, {useContext, useState} from 'react';
import {Audioable} from '../util/audio';
import {AudioContext} from './AudioContextProvider';
import {AudioPlayer} from './AudioPlayer';
import {AudioAction, AudioControls} from './AudioControls';

interface Props {
  preRecordedAudio?: Audioable;
  recordedAudio?: Audioable;
  recorderID: string;
  resetRecording: () => void;
}

export const AudioRecorderInactive = ({
  preRecordedAudio,
  recordedAudio,
  resetRecording,
  recorderID,
}: Props) => {
  const audioCtx = useContext(AudioContext);
  const [isEditing, setIsEditing] = useState(false);
  const record = async () => {
    await audioCtx.startRecord(recorderID);
  };
  if (recordedAudio) {
    const extraActions = [
      {
        onPress: resetRecording,
        iconName: 'times',
      },
    ];
    return <AudioPlayer audio={recordedAudio} extraActions={extraActions} />;
  }
  if (preRecordedAudio && !isEditing) {
    const extraActions: AudioAction[] = [
      {
        onPress: () => setIsEditing(true),
        iconName: 'edit',
      },
    ];
    return <AudioPlayer audio={preRecordedAudio} extraActions={extraActions} />;
  }
  const actions: AudioAction[] = [
    {iconName: 'stop'},
    {iconName: 'circle', status: 'danger', onPress: record},
  ];
  if (preRecordedAudio) {
    actions.push({
      onPress: () => setIsEditing(false),
      iconName: 'times',
    });
  }
  return (
    <AudioControls currentPositionMs={0} durationMs={0} actions={actions} />
  );
};
