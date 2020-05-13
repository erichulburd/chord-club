import React, { useContext, useEffect, useState } from 'react';
import { Audioable } from '../util/audio';
import { AudioContext } from './AudioContextProvider';
import { useRoute } from '@react-navigation/native';
import { AudioRecorderActive } from './AudioRecorderActive';
import { AudioRecorderInactive } from './AudioRecorderInactive';

interface Props {
  prerecorded?: Audioable;
  recorderID: string;
  onRecordComplete: (audio: Audioable | undefined) => void;
}

interface State {
  recording?: Audioable;
  rerecord: boolean;
}

export const AudioRecorder = ({ prerecorded, recorderID, onRecordComplete }: Props) => {
  const audioCtx = useContext(AudioContext);
  const [state, setState] = useState<State>({
    recording: undefined,
    rerecord: false,
  });

  const route = useRoute();
  useEffect(() => {
    if (recorderID !== audioCtx.focusedRecorderID) {
      audioCtx.stopRecord();
    }
  }, [route.key]);

  const clearRecording = () => {
    setState({ ...state, recording: undefined });
    onRecordComplete(undefined);
  };
  if (recorderID !== audioCtx.focusedRecorderID) {
    const audio = (!state.rerecord && prerecorded) ? prerecorded : state.recording;
    return (
      <AudioRecorderInactive
        recorderID={recorderID}
        audio={audio}
        resetRecording={clearRecording}
      />
    );
  }
  const onStopRecord = (recording: Audioable) => {
    setState({ ...state, recording });
    onRecordComplete(recording);
  }
  return (
    <AudioRecorderActive
      onStopRecord={onStopRecord}
    />
  );
}
