import React, { createContext, PropsWithChildren, useState, useContext } from 'react';
import AudioRecorderPlayer, { AudioSet, AudioEncoderAndroidType, AVEncodingOption, AVEncoderAudioQualityIOSType, AudioSourceAndroidType } from 'react-native-audio-recorder-player';
import logger from 'src/util/logger';
import { getRecordingPermissions } from 'src/util/permissions';
import { Platform } from 'react-native';
import {v4} from 'react-native-uuid';

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
  play: (audio: Audioable) => Promise<void>;
  stop: () => Promise<void>;
  startRecord: (recorderID: string) => Promise<void>;
  stopRecord: () => Promise<void>;
}

const audioContextNotInitialized = new Error('AudioContext not initialized');

export const AudioContext = createContext<AudioContextValue>({
  play: () => { throw audioContextNotInitialized },
  stop: () => { throw audioContextNotInitialized },
  startRecord: () => { throw audioContextNotInitialized },
  stopRecord: () => { throw audioContextNotInitialized },
});

export const AudioContextProvider = ({ children }: PropsWithChildren<{}>) => {
  const [state, setState] = useState<State>(initialState);
  const stop = async () => {
    setState({ ...state, focusedAudioURL: undefined });
    await audioRecorderPlayer.stopPlayer();
    audioRecorderPlayer.removePlayBackListener();
  };
  const stopRecord = async () => {
    setState({ ...state, focusedRecorderID: undefined });
    await audioRecorderPlayer.stopRecorder();
    audioRecorderPlayer.removeRecordBackListener();
  };
  const stopInProgress = async () => {
    if (state.focusedAudioURL) {
      await stop();
    }
    if (state.focusedRecorderID) {
      await stopRecord();
    }
  }
  const play = async (audio: Audioable) => {
    if (state.focusedAudioURL === audio.audioURL) {
      return;
    }
    await stopInProgress();
    setState({ ...state, focusedAudioURL: audio.audioURL });
  };
  const startRecord = async (recorderID: string) => {
    if (state.focusedRecorderID === recorderID) {
      return;
    }
    await stopInProgress();
    setState({ ...state, focusedRecorderID: recorderID });
  };
  const value = {
    ...state, play, stop, stopRecord, startRecord,
  };
  return (
    <AudioContext.Provider value={value}>
      {children}
    </AudioContext.Provider>
  )
};

interface AudioPlayingState {
  currentPositionSec: number;
  currentDurationSec: number;
  paused: boolean;
}

interface AudioPlayingContextValue extends AudioPlayingState {
  start: () => Promise<void>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  stop: () => Promise<void>;
  seek: (positionSec: number) => Promise<void>;
}

export const AudioPlayingContext = createContext<AudioPlayingContextValue>({
  currentPositionSec: 0,
  currentDurationSec: 0,
  paused: false,
  start: () => { throw audioContextNotInitialized },
  pause: () => { throw audioContextNotInitialized },
  resume: () => { throw audioContextNotInitialized },
  seek: () => { throw audioContextNotInitialized },
  stop: () => { throw audioContextNotInitialized },
});

export const AudioPlayingContextProvider = ({ children }: PropsWithChildren<{}>) => {
  const audioContext = useContext(AudioContext);
  const [state, setState] = useState<AudioPlayingState>({
    currentPositionSec: 0,
    currentDurationSec: 0,
    paused: false,
  });
  const start = async () => {
    if (!audioContext.focusedAudioURL) {
      return;
    }
    await audioRecorderPlayer.startPlayer(audioContext.focusedAudioURL);
    await audioRecorderPlayer.setVolume(1.0);

    audioRecorderPlayer.addPlayBackListener(async (e: any) => {
      const currentPositionSec = parseFloat(e.current_position);
      const currentDurationSec = parseFloat(e.duration);
      if (currentPositionSec >= currentDurationSec) {
        await audioContext.stop();
      } else {
        setState({
          ...state,
          currentPositionSec,
          currentDurationSec,
        });
      }
    });
  };

  const pause = async () => {
    await audioRecorderPlayer.pausePlayer();
    setState({...state, paused: true});
  };
  const resume = async () => {
    await audioRecorderPlayer.resumePlayer();
    setState({...state, paused: false});
  };

  const seek = async (positionSec: number) => {
    const { currentDurationSec } = state;
    let newPosition = positionSec;
    newPosition = Math.min(newPosition, currentDurationSec);
    newPosition = Math.max(newPosition, 0);
    newPosition = Math.round(newPosition);

    try {
      await audioRecorderPlayer.seekToPlayer(newPosition);
    } catch(err) {
      logger.error('seek failed', err);
    }
  }
  const stop = async () => {
    setState({
      ...state,
      currentPositionSec: 0,
      currentDurationSec: 0,
      paused: false,
    });
    await audioContext.stop()
  }
  const value = {
    ...state, start, stop, seek, pause, resume,
  };
  return (
    <AudioPlayingContext.Provider value={value}>
      {children}
    </AudioPlayingContext.Provider>
  )
};

interface AudioRecordingState {
  currentPositionSec: number;
  fileName: string;
  absFilePath: string;
}

interface AudioRecordingContextValue extends AudioRecordingState {
  start: () => Promise<void>;
  stopRecord: () => Promise<number>;
}

const initialRecordingState = {
  fileName: '',
  absFilePath: '',
  currentPositionSec: 0,
  start: () => { throw audioContextNotInitialized},
  stopRecord: () => { throw audioContextNotInitialized},
};
export const AudioRecordingContext = createContext<AudioRecordingContextValue>(initialRecordingState);

const audioSet: AudioSet = {
  AudioEncoderAndroid: AudioEncoderAndroidType.AAC,
  AudioSourceAndroid: AudioSourceAndroidType.MIC,
  AVEncoderAudioQualityKeyIOS: AVEncoderAudioQualityIOSType.high,
  AVNumberOfChannelsKeyIOS: 2,
  AVFormatIDKeyIOS: AVEncodingOption.aac,
};

const makeFileName = () => {
  const uuid = v4();
  return Platform.select({
    ios: `${uuid}.m4a`,
    android: `sdcard/${uuid}.mp4`,
    default: `${uuid}.m4a`,
  });
};

const AudioRecordingContextProvider = ({ children }: PropsWithChildren<{}>) => {
  const audioContext = useContext(AudioContext);
  const [state, setState] = useState<AudioRecordingState>(initialRecordingState);
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
      const currentPositionSec = parseFloat(e.current_position);
      setState({ ...state, currentPositionSec })
    });
  };
  const stopRecord = async () => {
    await audioContext.stopRecord();
    const { currentPositionSec } = state;
    setState({
      ...state,
      currentPositionSec: 0,
    });
    return currentPositionSec;
  }
  const value = {
    ...state, start, stopRecord,
  };
  return (
    <AudioRecordingContext.Provider value={value}>
      {children}
    </AudioRecordingContext.Provider>
  )
};


export const AudioContexts = ({ children }: PropsWithChildren<{}>) => (
  <AudioContextProvider>
    <AudioPlayingContextProvider>
      <AudioRecordingContextProvider>
        {children}
      </AudioRecordingContextProvider>
    </AudioPlayingContextProvider>
  </AudioContextProvider>
)
