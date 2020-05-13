import React, { useContext, useEffect, useState } from 'react';
import { Audioable } from '../util/audio';
import { AudioContext } from './AudioContextProvider';
import { useRoute } from '@react-navigation/native';
import { AudioRecorderActive } from './AudioRecorderActive';
import { AudioRecorderInactive } from './AudioRecorderInactive';
import { AudioAction } from './AudioControls';

interface Props {
  preRecordedAudio?: Audioable;
  recorderID: string;
  onRecordComplete: (audio: Audioable | undefined) => void;
}

export const AudioRecorder = ({ preRecordedAudio, recorderID, onRecordComplete }: Props) => {
  const audioCtx = useContext(AudioContext);
  const [recordedAudio, setRecordedAudio] = useState<Audioable | undefined>(undefined);
  const route = useRoute();
  useEffect(() => {
    if (recorderID !== audioCtx.focusedRecorderID) {
      audioCtx.stopRecord();
    }
  }, [route.key]);
  useEffect(() => {
    return () => setRecordedAudio(undefined);
  }, [recorderID]);

  const clearRecording = () => {
    setRecordedAudio(undefined);
    onRecordComplete(undefined);
  };
  const onStopRecord = (newAudio: Audioable) => {
    setRecordedAudio(newAudio)
    onRecordComplete(newAudio);
  }
  if (recorderID !== audioCtx.focusedRecorderID) {
    return (
      <AudioRecorderInactive
        recorderID={recorderID}
        preRecordedAudio={preRecordedAudio}
        recordedAudio={recordedAudio}
        resetRecording={clearRecording}
      />
    );
  }
  return (
    <AudioRecorderActive
      onStopRecord={onStopRecord}
    />
  );
}
