import AudioRecorderPlayer, {
  AVEncoderAudioQualityIOSType,
  AVEncodingOption,
  AudioEncoderAndroidType,
  AudioSet,
  AudioSourceAndroidType,
} from 'react-native-audio-recorder-player';
import {v4} from 'react-native-uuid';
import {Platform, StyleSheet, TouchableOpacity, View} from 'react-native';
import React, {Component} from 'react';
import {ratio, screenWidth} from './styles';
import {
  Button,
  ButtonGroup,
  Card,
  Text,
  withStyles,
  ThemedComponentProps,
} from '@ui-kitten/components';
import logger from '../../util/logger';
import {ThemedIcon} from '../FontAwesomeIcons';
import {getRecordingPermissions} from '../../util/permissions';
import {Row} from '../shared/Row';

const styles: any = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  viewBarWrapper: {
    marginTop: 10 * ratio,
    marginHorizontal: 10 * ratio,
    display: 'flex',
    alignItems: 'stretch',
    flexDirection: 'column',
    width: '100%',
  },
  viewBar: {
    height: 5 * ratio,
    width: '100%',
  },
  viewBarPlay: {
    height: 5 * ratio,
    width: 0,
  },
  playTimeAndDuration: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  elapsedText: {
    width: 80,
  },
  elapsed1: {
    width: 80,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  elapsed2: {
    width: 80,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
  },
});

interface State {
  isPlaying: boolean;
  isRecording: boolean;
  isPlayingPaused: boolean;
  hasRecorded: boolean;
  recordSecs: number;
  currentPositionSec: number;
  currentDurationSec: number;
  playTime: string;
  duration: string;
  fileName: string;
  absFilePath: string;
}

interface Props extends ThemedComponentProps {
  mountID: string;
  onRecordingComplete: (path: string, lengthMs: number) => void;
}

const getColors = (theme: Record<string, string>) => ({
  default: theme['border-basic-color-2'],
  lighter: theme['border-basic-color-1'],
  recording: theme['border-danger-color-4'],
  played: theme['border-primary-color-1'],
});

const makeFileName = () => {
  const uuid = v4();
  return Platform.select({
    ios: `${uuid}.m4a`,
    android: `sdcard/${uuid}.mp4`,
    default: `${uuid}.m4a`,
  });
};

const PlayTimeAndDuration = ({
  playTime,
  duration,
}: {
  playTime: string;
  duration: string;
}) => (
  <View style={styles.playTimeAndDuration}>
    <View style={styles.elapsed1}>
      <Text>{playTime}</Text>
    </View>
    <Text>/</Text>
    <View style={styles.elapsed2}>
      <Text>{duration}</Text>
    </View>
  </View>
);

class AudioRecorder extends Component<Props, State> {
  private audioRecorderPlayer: AudioRecorderPlayer;

  constructor(props: Props) {
    super(props);
    this.state = {
      isPlaying: false,
      isRecording: false,
      isPlayingPaused: false,
      hasRecorded: false,
      recordSecs: 0,
      currentPositionSec: 0,
      currentDurationSec: 0,
      playTime: '00:00:00',
      duration: '00:00:00',
      fileName: '',
      absFilePath: '',
    };

    this.audioRecorderPlayer = new AudioRecorderPlayer();
    try {
      this.audioRecorderPlayer.setSubscriptionDuration(0.09); // optional. Default is 0.1
    } catch (err) {
      logger.error('failed to initialize audio', err);
    }
  }

  public componentWillUnmount() {
    this._resetIfNecessary();
  }

  UNSAFE_componentWillReceiveProps(nextProps: Props) {
    const {mountID} = nextProps;
    if (mountID !== this.props.mountID) {
      this._resetIfNecessary();
    }
  }

  private _resetIfNecessary() {
    const { isPlaying, isPlayingPaused, isRecording } = this.state;
    if (isPlaying || isPlayingPaused) {
      this.onStopPlay();
    } else if (isRecording) {
      this.onStopRecord();
    }
    this.setState({
      hasRecorded: false,
      recordSecs: 0,
      currentPositionSec: 0,
      currentDurationSec: 0,
      playTime: '00:00:00',
      duration: '00:00:00',
      fileName: '',
      absFilePath: '',
    })
  }

  public render() {
    let playWidth =
      (this.state.currentPositionSec / this.state.currentDurationSec) *
      (screenWidth - 56 * ratio);
    if (!playWidth) {
      playWidth = 0;
    }
    const {eva} = this.props;
    const {isRecording, isPlaying, isPlayingPaused, hasRecorded} = this.state;
    const colors = getColors(eva?.theme || {});

    let buttonIcon = 'circle';
    let buttonOnPress = this.onStartRecord;
    if (isRecording) {
      buttonIcon = 'stop';
      buttonOnPress = this.onStopRecord;
    } else if (isPlayingPaused) {
      buttonIcon = 'play-circle';
      buttonOnPress = this.onResumePlay;
    } else if (isPlaying) {
      buttonIcon = 'pause-circle';
      buttonOnPress = this.onPausePlay;
    } else if (hasRecorded) {
      buttonIcon = 'play-circle';
      buttonOnPress = this.onStartPlay;
    }
    return (
      <Card
        appearance={'filled'}
        style={[styles.container, {backgroundColor: colors.default, margin: 3}]}
        status={isRecording ? 'danger' : isPlaying ? 'info' : 'basic'}
      >
        <Row>
        <Row>
            <Button
              appearance="outline"
              accessoryLeft={(props) =>
                React.createElement(ThemedIcon(buttonIcon), {
                  ...props,
                  solid: true,
                })
              }
              onPress={buttonOnPress}
            />
        </Row>
        </Row>
        <Row>
          <PlayTimeAndDuration
            playTime={this.state.playTime}
            duration={this.state.duration}
          />
        </Row>
        <Row>
          <TouchableOpacity
            style={styles.viewBarWrapper}
            onPress={this.onStatusPress}>
            <View style={[styles.viewBar, {backgroundColor: colors.lighter}]}>
              <View
                style={[
                  styles.viewBarPlay,
                  {width: playWidth, backgroundColor: colors.played},
                ]}
              />
            </View>
          </TouchableOpacity>
        </Row>
        {hasRecorded &&
          <Row>
            <Button
              appearance="ghost"
              onPress={() => console.error('FIXME on reset')}
            >Reset</Button>
          </Row>
        }
      </Card>
    );
  }

  private onStatusPress = async (e: any) => {
    const touchX = e.nativeEvent.locationX;
    console.log(`touchX: ${touchX}`);
    const playWidth =
      (this.state.currentPositionSec / this.state.currentDurationSec) *
      (screenWidth - 56 * ratio);
    console.log(`currentPlayWidth: ${playWidth}`);

    const currentPosition = Math.round(this.state.currentPositionSec);
    console.log(`currentPosition: ${currentPosition}`);

    if (playWidth && playWidth < touchX) {
      const addSecs = Math.round(currentPosition + 1000);
      await this.audioRecorderPlayer.seekToPlayer(addSecs);
      console.log(`addSecs: ${addSecs}`);
    } else {
      const subSecs = Math.round(currentPosition - 1000);
      await this.audioRecorderPlayer.seekToPlayer(subSecs);
      console.log(`subSecs: ${subSecs}`);
    }
  };

  private onStartRecord = async () => {
    const granted = await getRecordingPermissions();
    if (!granted) {
      return;
    }
    const audioSet: AudioSet = {
      AudioEncoderAndroid: AudioEncoderAndroidType.AAC,
      AudioSourceAndroid: AudioSourceAndroidType.MIC,
      AVEncoderAudioQualityKeyIOS: AVEncoderAudioQualityIOSType.high,
      AVNumberOfChannelsKeyIOS: 2,
      AVFormatIDKeyIOS: AVEncodingOption.aac,
    };
    const fileName = makeFileName();
    this.setState({
      hasRecorded: true,
      isRecording: true,
      playTime: '00:00:00',
      currentPositionSec: 0,
      fileName,
    });
    const absFilePath = await this.audioRecorderPlayer.startRecorder(
      fileName,
      audioSet,
    );
    this.setState({absFilePath});
    this.audioRecorderPlayer.addRecordBackListener((e: any) => {
      const recordTime = this.audioRecorderPlayer.mmssss(
        Math.floor(e.current_position),
      );
      this.setState({
        duration: recordTime,
        recordSecs: e.current_position,
      });
    });
  };

  private onStopRecord = async () => {
    const result = await this.audioRecorderPlayer.stopRecorder();
    this.audioRecorderPlayer.removeRecordBackListener();
    const {absFilePath, recordSecs} = this.state;
    const {onRecordingComplete} = this.props;
    onRecordingComplete(absFilePath, Math.round(recordSecs));
    this.setState({
      recordSecs: 0,
      playTime: '00:00:00',
      currentPositionSec: 0,
      isRecording: false,
    });
  };

  private onStartPlay = async () => {
    this.setState({isPlaying: true});
    await this.audioRecorderPlayer.startPlayer(this.state.fileName);
    await this.audioRecorderPlayer.setVolume(1.0);
    this.audioRecorderPlayer.addPlayBackListener(async (e: any) => {
      const update = {
        currentPositionSec: e.current_position,
        currentDurationSec: e.duration,
        playTime: this.audioRecorderPlayer.mmssss(
          Math.floor(e.current_position),
        ),
        duration: this.audioRecorderPlayer.mmssss(Math.floor(e.duration)),
        isPlaying: true,
      };
      if (e.current_position === e.duration) {
        await this.audioRecorderPlayer.stopPlayer();
        update.currentPositionSec = 0;
        update.playTime = '00:00:00';
        update.isPlaying = false;
      }
      this.setState(update);
    });
  };

  private onPausePlay = async () => {
    console.info('PAUSE PLAY');
    await this.audioRecorderPlayer.pausePlayer();
    this.setState({isPlaying: false, isPlayingPaused: true});
  };

  private onResumePlay = async () => {
    console.info('RESUME PLAY');
    await this.audioRecorderPlayer.resumePlayer();
    this.setState({isPlaying: true, isPlayingPaused: false});
  };

  private onStopPlay = async () => {
    await this.audioRecorderPlayer.stopPlayer();
    this.setState({
      isPlaying: false, isPlayingPaused: false,
      playTime: '00:00:00',
      currentPositionSec: 0,
      isRecording: false,
    });
    this.audioRecorderPlayer.removePlayBackListener();
  };
}

export default withStyles(AudioRecorder);
