import React from 'react';
import {View, StyleSheet, GestureResponderEvent} from 'react-native';
import {
  Button,
  withStyles,
  ThemedComponentProps,
} from '@ui-kitten/components';
import {ThemedIcon} from '../FontAwesomeIcons';
import {getCalRatio} from '../../util/screen';
import {
  Audioable,
  AudioEventType,
  State as AudioState,
} from '../../util/audio';
import {AudioContextProps, withAudioContext } from '../AudioContexts';

interface Props extends ThemedComponentProps, AudioContextProps {
  audio: Audioable;
}

interface State {
  width: number;
  audioState?: AudioState;
  subscription?: ZenObservable.Subscription;
}

const getColors = (theme: Record<string, string>) => ({
  default: theme['border-basic-color-2'],
  lighter: theme['border-basic-color-2'] || '#1A2138',
  recording: theme['border-danger-color-4'],
  played: theme['border-primary-color-1'] || '#3366FF',
});

class AudioPlayer extends React.Component<Props> {
  public state: State = { width: getCalRatio().width };

  constructor(props: Props) {
    super(props);
  }

  public componentWillUnmount() {
    this._unsubscribe();
  }

  private _unsubscribe() {
    if (this.state.subscription) {
      this.state.subscription.unsubscribe();
      this.setState({subscription: undefined});
    }
  }

  private _play = () => {
    const {audio, audioCtx} = this.props;
    if (!this.state.subscription) {
      const { audioCtx } = this.props;
      const subscription = audioCtx.subscribe({
        next: (audioEvent) => {
          if (
            audioEvent.type === AudioEventType.PLAY &&
            audioEvent.state.currentURL !== audio.audioURL
          ) {
            this._unsubscribe();
          }
        },
      });
      this.setState({subscription});
    }
    audioCtx.play(audio);
  };

  public render() {
    const {audio, eva, audioCtx} = this.props;

    let playWidth = 0;
    const dims = getCalRatio();
    const fullWidth = dims.width - 100 * dims.ratio;
    if (
      audioCtx.isPlaying(audio.audioURL) ||
      audioCtx.isPaused(audio.audioURL)
    ) {
      playWidth = audioCtx.playRatio() * (dims.width - 100 * dims.ratio);
      if (!playWidth) {
        playWidth = 0;
      }
    }
    const colors = getColors(eva?.theme || {});
    let actionIcon = ThemedIcon('play');
    let action = this._play;
    if (audioCtx.isPlaying(audio.audioURL)) {
      if (audioCtx.isPaused(audio.audioURL)) {
        action = () => audioCtx.resume();
      } else {
        actionIcon = ThemedIcon('pause');
        action = () => audioCtx.pause();
      }
    }
    const seek = (e: GestureResponderEvent) => {
      const ratio = (e.nativeEvent.locationX  / this.state.width);
      audioCtx.seek(ratio);
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

export default withStyles(withAudioContext(AudioPlayer));
