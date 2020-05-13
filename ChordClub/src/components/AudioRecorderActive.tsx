import React, {useContext, useState, useEffect, useCallback} from 'react';
import {AudioContext} from './AudioContextProvider';
import {Audioable, makeFileName, audioSet} from '../util/audio';
import {getRecordingPermissions} from '../util/permissions';
import {AudioControls, AudioAction} from './AudioControls';
import { ModalContext } from './ModalProvider';

interface Props {
  onStopRecord: (recorded: Audioable) => void;
}

const MAX_RECORDING_MS = 5 * 60 * 1000;

export const AudioRecorderActive = ({onStopRecord}: Props) => {
  const modalCtx = useContext(ModalContext);
  const [absFilePath, setAbsFilePath] = useState('');
  const [currentPositionMs, setCurrentPositionMs] = useState(0);
  const [started, setStarted] = useState(false);
  const audioCtx = useContext(AudioContext);
  const {audioRecorderPlayer} = audioCtx;
  const stopRecord = async (audioURL: string, audioLength: number) => {
    const audioRecording = {
      audioLength: Math.round(audioLength),
      audioURL,
    };
    await audioCtx.stopRecord();
    onStopRecord(audioRecording);
  };

  const recordBackListener = (audioURL: string) => async (e: any) => {
    const newCurrentPositionMS = parseFloat(e.current_position);
    setCurrentPositionMs(newCurrentPositionMS);
    if (newCurrentPositionMS >= MAX_RECORDING_MS - 200) {
      await stopRecord(audioURL, newCurrentPositionMS);
      modalCtx.message({
        msg: 'We currently limit uploads to 5 minutes.',
        status: 'warning',
      })
    }
  };
  const start = useCallback(async () => {
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
    audioRecorderPlayer.addRecordBackListener(recordBackListener(absFilePath));
  }, []);
  useEffect(
    useCallback(() => {
      if (!started) {
        start();
      }
    }, [started]),
  );

  const actions: AudioAction[] = [
    {iconName: 'stop', onPress: () => stopRecord(absFilePath, currentPositionMs)},
    {iconName: 'circle', status: 'danger'},
  ];
  return (
    <AudioControls
      currentPositionMs={currentPositionMs}
      durationMs={MAX_RECORDING_MS}
      actions={actions}
    />
  );
};
