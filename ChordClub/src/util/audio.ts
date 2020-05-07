import Observable from 'zen-observable';
import {ObservableState} from './observableState';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import {getCalRatio} from '../util/screen';
import {GestureResponderEvent} from 'react-native';
import logger from './logger';

export interface Audioable {
  audioURL: string;
  audioLength: number;
}

export interface State {
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

let currentState: State = {
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

class AudioObservable {
  private subscribers: Set<ZenObservable.Observer<AudioEvent>>;
  public observable: Observable<AudioEvent>;

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

  public publish = (update: Partial<State>, eventType: AudioEventType) => {
    currentState = Object.freeze({...currentState, ...update});
    this.subscribers.forEach((observer) => {
      if (observer.next) {
        observer.next({
          state: currentState,
          type: eventType,
        });
      }
    });
  };
}

export const audioStateObservable = new AudioObservable();

export class AudioStateObserver {
  public state: State;
  private audioObversable: AudioObservable;
  private subscription: ZenObservable.Subscription;
  constructor(aobs: AudioObservable = audioStateObservable) {
    this.state = currentState;
    this.audioObversable = aobs;
    this.subscription = this.audioObversable.observable.subscribe({
      next: (e) => {
        this.state = e.state;
      }
    });
  }

  public close() {
    this.subscription.unsubscribe();
  }

  public subscribe = (observer: ZenObservable.Observer<AudioEvent>) => {
    return this.audioObversable.observable.subscribe(observer);
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

    console.warn('PLAY', this.state)
    if (this.state.isPlaying) {
      await this.stop();
    }
    this.audioObversable.publish(
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
      this.audioObversable.publish(update, eventType);
    });
  };

  public pause = async () => {
    this.audioObversable.publish(
      {isPlaying: false, isPlayingPaused: true},
      AudioEventType.PAUSE,
    );
    await this.state.audioRecorderPlayer.pausePlayer();
  };

  public resume = async () => {
    this.audioObversable.publish(
      {isPlaying: true, isPlayingPaused: false},
      AudioEventType.RESUME,
    );
    await this.state.audioRecorderPlayer.resumePlayer();
  };

  public stop = async () => {
    this.audioObversable.publish(
      {isPlaying: false, isPlayingPaused: false},
      AudioEventType.STOP,
    );
    await this.state.audioRecorderPlayer.stopPlayer();
    this.state.audioRecorderPlayer.removePlayBackListener();
  };

  public seek = async (ratio: number) => {
    const { currentDurationSec } = this.state;
    let newPosition = ratio * currentDurationSec;
    newPosition = Math.min(newPosition, currentDurationSec);
    newPosition = Math.max(newPosition, 0);
    newPosition = Math.round(newPosition);

    awaitingSeek = true;
    const {audioRecorderPlayer} = this.state;
    try {
      await audioRecorderPlayer.seekToPlayer(newPosition);
    } catch(err) {
      logger.error('seek failed', err);
    }
    // position will be updated in addPlayBackListener.
    this.audioObversable.publish({}, AudioEventType.SEEK);
  };
}

let awaitingSeek = false;
