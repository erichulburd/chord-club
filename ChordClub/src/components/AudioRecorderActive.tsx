import React, { useContext, useState, useEffect } from 'react';
import { AudioRecordingContext } from './AudioContexts';
import { Button } from '@ui-kitten/components';
import { View } from 'react-native';
import { ThemedIcon } from './FontAwesomeIcons';
import { AudioPlayerProgress } from './AudioPlayerProgress';
import { Audioable } from '../util/audio';

interface Props {
  onStopRecord: (recorded: Audioable) => void;
}

interface State {
  started: boolean;
}

export const AudioRecorderActive = ({
  onStopRecord,
}: Props) => {
  const [state, setState] = useState({ started: false });
  const audioCtx = useContext(AudioRecordingContext);
  useEffect(() => {
    if (!state.started) {
      setState({ started: true });
      audioCtx.start();
    }
  })
  const stop = async () => {
    const audioLength = await audioCtx.stopRecord();
    onStopRecord({
      audioLength,
      audioURL: audioCtx.absFilePath,
    });
  }
  return (
    <View>
      <Button
        accessoryLeft={ThemedIcon('stop', { solid: true })}
        onPress={stop}
      />
      <AudioPlayerProgress
        playPosition={audioCtx.currentPositionSec}
        playDuration={audioCtx.currentPositionSec}
      />
    </View>
  );
};
