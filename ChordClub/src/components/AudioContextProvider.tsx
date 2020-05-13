import React, { createContext, PropsWithChildren, useState } from 'react';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';

export interface Audioable {
  audioURL: string;
  audioLength: number;
}

const audioRecorderPlayer = new AudioRecorderPlayer();

interface State {
  focusedAudioURL?: string;
  focusedRecorderID?: string;
}

const initialState: State = {};

interface AudioContextValue extends State {
  audioRecorderPlayer: AudioRecorderPlayer;
  startPlay: (audio: Audioable) => Promise<void>;
  stopPlay: () => Promise<void>;
  startRecord: (recorderID: string) => Promise<void>;
  stopRecord: () => Promise<void>;
}

const audioContextNotInitialized = new Error('AudioContext not initialized');

export const AudioContext = createContext<AudioContextValue>({
  audioRecorderPlayer,
  startPlay: () => { throw audioContextNotInitialized },
  stopPlay: () => { throw audioContextNotInitialized },
  startRecord: () => { throw audioContextNotInitialized },
  stopRecord: () => { throw audioContextNotInitialized },
});

export const AudioContextProvider = ({ children }: PropsWithChildren<{}>) => {
  const [state, setState] = useState<State>(initialState);
  const startPlay = async (audio: Audioable) => {
    if (state.focusedAudioURL === audio.audioURL) {
      return;
    }
    await stopInProgress();
    setState({ ...state, focusedAudioURL: audio.audioURL });
  };
  const stopPlay = async () => {
    setState({ ...state, focusedAudioURL: undefined });
    await audioRecorderPlayer.stopPlayer();
    audioRecorderPlayer.removePlayBackListener();
  };
  const startRecord = async (recorderID: string) => {
    if (state.focusedRecorderID === recorderID) {
      return;
    }
    await stopInProgress();
    setState({ ...state, focusedRecorderID: recorderID });
  };
  const stopRecord = async () => {
    setState({ ...state, focusedRecorderID: undefined });
    await audioRecorderPlayer.stopRecorder();
    audioRecorderPlayer.removeRecordBackListener();
  };
  const stopInProgress = async () => {
    if (state.focusedAudioURL) {
      await stopPlay();
    }
    if (state.focusedRecorderID) {
      await stopRecord();
    }
  }

  const value = {
    ...state,
    startPlay, stopPlay, stopRecord, startRecord,
    audioRecorderPlayer,
  };
  return (
    <AudioContext.Provider value={value}>
      {children}
    </AudioContext.Provider>
  )
};
