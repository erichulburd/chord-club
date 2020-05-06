import React, {PropsWithChildren} from 'react';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import {getCalRatio} from '../util/screen';
import {GestureResponderEvent} from 'react-native';

export interface Audioable {
  audioURL: string;
  audioLength: number;
}

interface State {
  currentURL?: string;
  isPlaying: boolean;
  isPlayingPaused: boolean;
  currentPositionSec: number;
  currentDurationSec: number;
}

interface SeekEvent {
  nativeEvent: {
    locationX: number;
  };
}

interface AudioPlayerContextValue {
  state: State;
  play: (url: Audioable) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  seek: (e: GestureResponderEvent) => void;
  isPlaying: (url: string) => boolean;
  isPaused: (url: string) => boolean;
  playRatio: () => number;
}

const initialState: State = {
  isPlaying: false,
  isPlayingPaused: false,
  currentPositionSec: 0,
  currentDurationSec: 0,
};

const AudioPlayerNotInitializedError = new Error(
  'Audio player not initialized',
);

const AudioPlayerContext = React.createContext<AudioPlayerContextValue>({
  state: initialState,
  play: (url: Audioable) => {
    throw AudioPlayerNotInitializedError;
  },
  pause: () => {
    throw AudioPlayerNotInitializedError;
  },
  resume: () => {
    throw AudioPlayerNotInitializedError;
  },
  stop: () => {
    throw AudioPlayerNotInitializedError;
  },
  seek: (e: GestureResponderEvent) => {
    throw AudioPlayerNotInitializedError;
  },
  isPlaying: (url: string) => {
    throw AudioPlayerNotInitializedError;
  },
  isPaused: (url: string) => {
    throw AudioPlayerNotInitializedError;
  },
  playRatio: () => {
    throw AudioPlayerNotInitializedError;
  },
});

export class AudioPlayerProvider extends React.Component<{}, State> {
  private audioRecorderPlayer: AudioRecorderPlayer;
  public state: State = initialState;

  constructor(props: {}, context: any) {
    super(props, context);
    this.audioRecorderPlayer = new AudioRecorderPlayer();
    this.audioRecorderPlayer.setSubscriptionDuration(0.09); // optional. Default is 0.1
  }

  public componentWillUnmount() {
    this.audioRecorderPlayer.stopPlayer();
    this.audioRecorderPlayer.removePlayBackListener();
  }

  private isPlaying = (audioURL: string) => {
    const {currentURL, isPlaying} = this.state;
    return currentURL === audioURL && isPlaying;
  };

  private isPaused = (audioURL: string) => {
    const {currentURL, isPlayingPaused} = this.state;
    return currentURL === audioURL && isPlayingPaused;
  };

  private play = async (url: Audioable) => {
    if (this.state.isPlaying) {
      await this.stop();
    }
    this.setState({
      currentURL: url.audioURL,
      currentPositionSec: 0,
      currentDurationSec: url.audioLength * 1000,
    });
    const {audioRecorderPlayer} = this;
    audioRecorderPlayer.startPlayer(url.audioURL);
    audioRecorderPlayer.setVolume(1.0);

    audioRecorderPlayer.addPlayBackListener((e: any) => {
      const update = {
        currentPositionSec: parseFloat(e.current_position),
        currentDurationSec: parseFloat(e.duration),
        isPlaying: true,
      };
      if (parseFloat(e.current_position) >= parseFloat(e.duration)) {
        audioRecorderPlayer.stopPlayer();
        update.isPlaying = false;
      }
      this.setState(update);
    });
  };

  private pause = async () => {
    this.setState({isPlaying: false, isPlayingPaused: true});
    await this.audioRecorderPlayer.pausePlayer();
  };

  private resume = async () => {
    if (!this.state.isPlayingPaused) {
      return;
    }
    this.setState({isPlaying: true, isPlayingPaused: false});
    await this.audioRecorderPlayer.resumePlayer();
  };

  private stop = async () => {
    return new Promise((resolve) => {
      this.setState({isPlaying: false, isPlayingPaused: false}, () => {
        this.audioRecorderPlayer.stopPlayer();
        this.audioRecorderPlayer.removePlayBackListener();
        resolve();
      });
    });
  };

  private seek = (e: GestureResponderEvent) => {
    const touchX = e.nativeEvent.locationX;
    const dims = getCalRatio();
    const playWidth =
      (this.state.currentPositionSec / this.state.currentDurationSec) *
      (dims.width - 56 * dims.ratio);

    const currentPosition = Math.round(this.state.currentPositionSec);

    if (playWidth && playWidth < touchX) {
      const addSecs = Math.round(currentPosition + 1000);
      this.audioRecorderPlayer.seekToPlayer(addSecs);
    } else {
      const subSecs = Math.round(currentPosition - 1000);
      this.audioRecorderPlayer.seekToPlayer(subSecs);
    }
  };

  private playRatio() {
    const {currentPositionSec, currentDurationSec} = this.state;
    if (currentDurationSec <= 0) {
      return 0;
    }
    return currentPositionSec / currentDurationSec;
  }

  public render() {
    const value: AudioPlayerContextValue = {
      state: this.state,

      isPlaying: this.isPlaying,
      isPaused: this.isPaused,
      playRatio: this.playRatio,
      play: this.play,
      pause: this.pause,
      stop: this.stop,
      resume: this.resume,
      seek: this.seek,
    };
    return (
      <AudioPlayerContext.Provider value={value}>
        {this.props.children}
      </AudioPlayerContext.Provider>
    );
  }
}

export interface AudioPlayerContextProps {
  audioCtx: AudioPlayerContextValue;
}

export const withAudioPlayerContext = <P extends {}>(
  Component: React.ComponentType<P & AudioPlayerContextProps>,
) => {
  return (props: PropsWithChildren<P>) => (
    <AudioPlayerContext.Consumer>
      {(value: AudioPlayerContextValue) => (
        <Component audioCtx={value} {...props} />
      )}
    </AudioPlayerContext.Consumer>
  );
};
