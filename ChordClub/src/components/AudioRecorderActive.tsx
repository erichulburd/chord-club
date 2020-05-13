import React, { useContext, useState, useEffect } from 'react';
import { AudioContext } from './AudioContextProvider';
import { Button } from '@ui-kitten/components';
import { View } from 'react-native';
import { ThemedIcon } from './FontAwesomeIcons';
import { AudioPlayerProgress } from './AudioPlayerProgress';
import { Audioable, makeFileName, audioSet } from '../util/audio';
import { getRecordingPermissions } from '../util/permissions';

interface Props {
  onStopRecord: (recorded: Audioable) => void;
}

interface State {
  currentPositionMs: number;
  fileName: string;
  absFilePath: string;
  started: boolean;
}

export const AudioRecorderActive = ({
  onStopRecord,
}: Props) => {
  const [state, setState] = useState<State>({
    fileName: '',
    absFilePath: '',
    currentPositionMs: 0,
    started: false,
  });
  const audioCtx = useContext(AudioContext);
  const {audioRecorderPlayer} = audioCtx
  const start = async () => {
    let granted = false;
    try {
      granted = await getRecordingPermissions();
    } catch (_err) {}
    if (!granted) {
      return;
    }
    const fileName = makeFileName();
    const absFilePath = await audioRecorderPlayer.startRecorder(
      fileName,
      audioSet,
    );
    setState({ ...state, fileName, absFilePath });
    audioRecorderPlayer.addRecordBackListener((e: any) => {
      const currentPositionMs = parseFloat(e.current_position);
      setState({ ...state, currentPositionMs })
    });
  };
  const stopRecord = async () => {
    await audioCtx.stopRecord();
    const { currentPositionMs } = state;
    setState({
      ...state,
      currentPositionMs: 0,
    });
    return currentPositionMs;
  }
  useEffect(() => {
    if (!state.started) {
      setState({ ...state, started: true });
      start();
    }
  })
  const stop = async () => {
    const audioLength = await stopRecord();
    onStopRecord({
      audioLength,
      audioURL: state.absFilePath,
    });
  }
  const {currentPositionMs} = state;
  return (
    <View>
      <Button
        accessoryLeft={ThemedIcon('stop', { solid: true })}
        onPress={stop}
      />
      <AudioPlayerProgress
        playPosition={currentPositionMs}
        playDuration={currentPositionMs}
      />
    </View>
  );
};
