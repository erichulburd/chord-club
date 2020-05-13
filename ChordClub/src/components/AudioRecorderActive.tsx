import React, { useContext, useState, useEffect, useCallback } from 'react';
import { AudioContext } from './AudioContextProvider';
import { Audioable, makeFileName, audioSet } from '../util/audio';
import { getRecordingPermissions } from '../util/permissions';
import { AudioControls, AudioAction } from './AudioControls';

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
  const [absFilePath, setAbsFilePath] = useState('');
  const [currentPositionMs, setCurrentPositionMs] = useState(0);
  const [started, setStarted] = useState(false);
  const audioCtx = useContext(AudioContext);
  const {audioRecorderPlayer} = audioCtx;
  const recordBackListener = (e: any) => {
    setCurrentPositionMs(parseFloat(e.current_position));
  };
  const start = async () => {
    setStarted(true);
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
    setAbsFilePath(absFilePath);
    audioRecorderPlayer.addRecordBackListener(recordBackListener);
  };
  const stopRecord = useCallback(async () => {
    const audioRecording = {
      audioLength: Math.round(currentPositionMs),
      audioURL: absFilePath,
    };
    await audioCtx.stopRecord();
    onStopRecord(audioRecording);
  }, [absFilePath, currentPositionMs]);
  useEffect(useCallback(() => {
    if (!started) {
      start();
    }
  }, [started]));

  const actions: AudioAction[] = [
    { iconName: 'stop', onPress: stopRecord },
    { iconName: 'circle', status: 'danger' },
  ];
  return (
    <AudioControls
      currentPositionMs={0}
      durationMs={currentPositionMs}
      actions={actions}
    />
  );
};
