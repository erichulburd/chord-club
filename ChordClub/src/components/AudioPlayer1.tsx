import React, { useState } from 'react';
import {View, StyleSheet, GestureResponderEvent} from 'react-native';
import {
  Button,
  withStyles,
  ThemedComponentProps,
  Text,
} from '@ui-kitten/components';
import {ThemedIcon} from './FontAwesomeIcons';
import {
  TouchableOpacity,
  TapGestureHandler,
  NativeViewGestureHandler,
} from 'react-native-gesture-handler';
import {getCalRatio} from '../util/screen';
import {
  AudioStateObserver,
  Audioable,
  AudioEventType,
  audioStateObservable,
  State as AudioState,
} from '../util/audio';
import last from 'lodash/last';

interface Props extends ThemedComponentProps {
  audio: Audioable;
}

interface State {
  width: number;
  audioState?: AudioState;
  subscription?: ZenObservable.Subscription;
}

const getColors = (theme: Record<string, string>) => ({
  default: theme['border-basic-color-2'],
  lighter: theme['border-basic-color-2'],
  recording: theme['border-danger-color-4'],
  played: theme['border-primary-color-1'],
});

export class AudioPlayer extends React.Component<Props> {
  private audioStateObserver: AudioStateObserver;
  public state: State = { width: getCalRatio().width };

  constructor(props: Props) {
    super(props);
    this.audioStateObserver = new AudioStateObserver();
  }

  public componentWillUnmount() {
    this._unsubscribe();
  }

  private _unsubscribe() {
    this.audioStateObserver.close();
    if (this.state.subscription) {
      this.state.subscription.unsubscribe();
      this.setState({subscription: undefined});
    }
  }

  private _play = () => {
    const {audio} = this.props;
    if (!this.state.subscription) {
      const subscription = this.audioStateObserver.subscribe({
        next: (audioEvent) => {
          console.info(audioEvent.type, last(audio.audioURL.split('/')));
          if (
            audioEvent.type === AudioEventType.PLAY &&
            audioEvent.state.currentURL !== audio.audioURL
          ) {
            this._unsubscribe();
          } else {
            this.audioStateObserver.state = audioEvent.state;
            this.setState({audioState: audioEvent.state});
          }
        },
      });
      this.setState({subscription});
    }
    this.audioStateObserver.play(audio);
  };

  public render() {
    const {audioStateObserver} = this;
    const {audio, eva} = this.props;

    let playWidth = 0;
    const dims = getCalRatio();
    const fullWidth = dims.width - 100 * dims.ratio;
    if (
      audioStateObserver.isPlaying(audio.audioURL) ||
      audioStateObserver.isPaused(audio.audioURL)
    ) {
      playWidth =
        audioStateObserver.playRatio() * (dims.width - 100 * dims.ratio);
      if (!playWidth) {
        playWidth = 0;
      }
    }
    const colors = getColors(eva?.theme || {});
    let actionIcon = ThemedIcon('play');
    let action = this._play;
    if (audioStateObserver.isPlaying(audio.audioURL)) {
      if (audioStateObserver.isPaused(audio.audioURL)) {
        action = () => audioStateObserver.resume();
      } else {
        actionIcon = ThemedIcon('pause');
        action = () => audioStateObserver.pause();
      }
    }
    const seek = (e: GestureResponderEvent) => {
      const ratio = (e.nativeEvent.locationX  / this.state.width);
      console.info('RATIO', e.nativeEvent.locationX , this.state.width, ratio);
      audioStateObserver.seek(ratio);
    }
    return (
      <View style={styles.container}>
        <View style={styles.innerContainer}>
          <Button
            appearance="ghost"
            status="success"
            size="small"
            accessoryLeft={actionIcon}
            onPress={action}
          />
          <View
            onTouchEndCapture={seek}
            onLayout={(e) => this.setState({ width: e.nativeEvent.layout.width })}
          >
            <View
              style={[
                styles.viewBar,
                {width: fullWidth, backgroundColor: colors.lighter},
              ]}>
              <View
                style={[
                  styles.viewBarPlay,
                  {width: playWidth, backgroundColor: colors.played},
                ]}
              />
            </View>
          </View>
        </View>
      </View>
    );
  }
}

const initialDims = getCalRatio();
const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  innerContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewBar: {
    height: 20 * initialDims.ratio,
  },
  viewBarPlay: {
    height: 20 * initialDims.ratio,
    width: 0,
  },
});

export default withStyles(AudioPlayer);
