import React, { useContext } from 'react';
import { Audioable } from '../util/audio';
import { AudioContext } from './AudioContextProvider';
import { Button } from '@ui-kitten/components';
import { View } from 'react-native';
import { ThemedIcon } from './FontAwesomeIcons';
import { AudioPlayer } from './AudioPlayer';

interface Props {
  audio?: Audioable;
  recorderID: string;
  resetRecording: () => void;
}

export const AudioRecorderInactive = ({
  audio, resetRecording, recorderID,
}: Props) => {
  const audioCtx = useContext(AudioContext);
  const record = () => {
    audioCtx.startRecord(recorderID);
  }
  if (audio) {
    return (
      <>
        <AudioPlayer audio={audio} />
        <Button
          status="danger"
          accessoryLeft={ThemedIcon('times', { solid: true })}
          onPress={resetRecording}
        />
      </>
    );
  }
  return (
    <View>
      <Button
        accessoryLeft={ThemedIcon('circle', { solid: true })}
        onPress={record}
      />
    </View>
  );
};
