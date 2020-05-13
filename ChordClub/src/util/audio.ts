import Observable from 'zen-observable';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import {GestureResponderEvent} from 'react-native';
import logger from './logger';

export interface Audioable {
  audioURL: string;
  audioLength: number;
}

export interface AudioState {
  currentURL?: string;
  audioRecorderPlayer: AudioRecorderPlayer;
  isPlaying: boolean;
  isPlayingPaused: boolean;
  currentPositionSec: number;
  currentDurationSec: number;
}

interface Actions {
  play: (url: Audioable) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  seek: (e: GestureResponderEvent) => void;
  isPlaying: (url: string) => boolean;
  isPaused: (url: string) => boolean;
  playRatio: () => number;
}

const audioRecorderPlayer = new AudioRecorderPlayer();

let initialState: State = {
  audioRecorderPlayer,
  currentURL: '',
  isPlaying: false,
  isPlayingPaused: false,
  currentPositionSec: 0,
  currentDurationSec: 0,
};

export enum AudioEventType {
  PLAY,
  PAUSE,
  RESUME,
  FINISHED,
  STOP,
  SEEK,
  UPDATE,
}

interface AudioEvent {
  state: State;
  type: AudioEventType;
}

export class AudioObservable {
  private subscribers: Set<ZenObservable.Observer<AudioEvent>>;
  public observable: Observable<AudioEvent>;
  private state = initialState;

  constructor() {
    this.subscribers = new Set<ZenObservable.Observer<AudioEvent>>();
    const subscribers = this.subscribers;
    this.observable = new Observable<AudioEvent>((observer) => {
      subscribers.add(observer);
      return async () => {
        subscribers.delete(observer);
        if (subscribers.size === 0) {
          await audioRecorderPlayer.stopPlayer();
          audioRecorderPlayer.removePlayBackListener();
        }
      };
    });
  }

  public subscribe = (observer: ZenObservable.Observer<AudioEvent>) => {
    return this.observable.subscribe(observer);
  };

  public isPlaying = (audioURL: string) => {
    const {currentURL, isPlaying} = this.state;
    return currentURL === audioURL && isPlaying;
  };

  public isPaused = (audioURL: string) => {
    const {currentURL, isPlayingPaused} = this.state;
    return currentURL === audioURL && isPlayingPaused;
  };

  public playRatio = () => {
    const {currentPositionSec, currentDurationSec} = this.state;
    if (currentDurationSec <= 0) {
      return 0;
    }
    return currentPositionSec / currentDurationSec;
  };

  public play = async (url: Audioable) => {
    if (this.state.isPlaying) {
      await this.stop();
    }
    this.publish(
      {
        currentURL: url.audioURL,
        currentPositionSec: 0,
        currentDurationSec: url.audioLength * 1000,
        isPlaying: true,
        isPlayingPaused: false,
      },
      AudioEventType.PLAY,
    );
    const {audioRecorderPlayer} = this.state;
    await audioRecorderPlayer.startPlayer(url.audioURL);
    await audioRecorderPlayer.setVolume(1.0);

    audioRecorderPlayer.addPlayBackListener(async (e: any) => {
      const update = {
        currentPositionSec: parseFloat(e.current_position),
        currentDurationSec: parseFloat(e.duration),
        isPlaying: true,
      };
      let eventType = AudioEventType.UPDATE;
      if (parseFloat(e.current_position) >= parseFloat(e.duration)) {
        await audioRecorderPlayer.stopPlayer();
        update.isPlaying = false;
        eventType = AudioEventType.FINISHED;
      }
      this.publish(update, eventType);
    });
  };

  public pause = async () => {
    this.publish(
      {isPlaying: false, isPlayingPaused: true},
      AudioEventType.PAUSE,
    );
    await this.state.audioRecorderPlayer.pausePlayer();
  };

  public resume = async () => {
    await this.state.audioRecorderPlayer.resumePlayer();
    this.publish(
      {isPlaying: true, isPlayingPaused: false},
      AudioEventType.RESUME,
    );
  };

  public stop = async () => {
    await this.state.audioRecorderPlayer.stopPlayer();
    this.state.audioRecorderPlayer.removePlayBackListener();
    this.publish(
      {isPlaying: false, isPlayingPaused: false},
      AudioEventType.STOP,
    );
  };

  public seek = async (ratio: number) => {
    const { currentDurationSec } = this.state;
    let newPosition = ratio * currentDurationSec;
    newPosition = Math.min(newPosition, currentDurationSec);
    newPosition = Math.max(newPosition, 0);
    newPosition = Math.round(newPosition);

    const {audioRecorderPlayer} = this.state;
    try {
      await audioRecorderPlayer.seekToPlayer(newPosition);
    } catch(err) {
      logger.error('seek failed', err);
    }
    // position will be updated in addPlayBackListener.
    this.publish({}, AudioEventType.SEEK);
  };

  private publish = (update: Partial<State>, eventType: AudioEventType) => {
    this.state = Object.freeze({...this.state, ...update});
    this.subscribers.forEach((observer) => {
      if (observer.next) {
        observer.next({
          state: this.state,
          type: eventType,
        });
      }
    });
  };
}

export const audioObservable = new AudioObservable();


