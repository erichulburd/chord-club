import React, { useContext, useEffect, useState } from 'react';
import { Audioable } from '../util/audio';
import { AudioContext } from './AudioContextProvider';
import { useRoute } from '@react-navigation/native';
import { AudioRecorderActive } from './AudioRecorderActive';
import { AudioRecorderInactive } from './AudioRecorderInactive';

interface Props {
  preRecordedAudio?: Audioable;
  recorderID: string;
  onRecordComplete: (audio: Audioable | undefined) => void;
}

interface State {
  recordedAudio?: Audioable;
  rerecord: boolean;
}

export const AudioRecorder = ({ preRecordedAudio, recorderID, onRecordComplete }: Props) => {
  const audioCtx = useContext(AudioContext);
  const [state, setState] = useState<State>({
    recordedAudio: undefined,
    rerecord: false,
  });

  const route = useRoute();
  useEffect(() => {
    if (recorderID !== audioCtx.focusedRecorderID) {
      audioCtx.stopRecord();
    }
  }, [route.key]);

  const clearRecording = () => {
    setState({ ...state, recordedAudio: undefined });
    onRecordComplete(undefined);
  };
  const onStopRecord = (recordedAudio: Audioable) => {
    setState({ ...state, recordedAudio });
    onRecordComplete(recordedAudio);
  }
  if (recorderID !== audioCtx.focusedRecorderID) {
    const audio = (!state.rerecord && preRecordedAudio) ? preRecordedAudio : state.recordedAudio;
    return (
      <AudioRecorderInactive
        recorderID={recorderID}
        audio={audio}
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
