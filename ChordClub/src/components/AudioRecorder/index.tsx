
import AudioRecorderPlayer, {
  AVEncoderAudioQualityIOSType,
  AVEncodingOption,
  AudioEncoderAndroidType,
  AudioSet,
  AudioSourceAndroidType,
} from 'react-native-audio-recorder-player';
import {
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { Component } from 'react';
import { ratio, screenWidth } from './styles';
import { Button, ButtonGroup, Card, Text, withStyles, ThemedComponentProps } from '@ui-kitten/components';
import logger from '../../util/logger';
import { ThemedIcon } from '../FontAwesomeIcons';
import { getRecordingPermissions } from '../../util/permissions';
import { Row } from '../shared/Row';

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
});

interface State {
  isPlaying: boolean;
  isRecording: boolean;
  isPlayingPaused: boolean;
  hasRecorded: boolean;
  isLoggingIn: boolean;
  recordSecs: number;
  currentPositionSec: number;
  currentDurationSec: number;
  playTime: string;
  duration: string;
}

interface Props extends ThemedComponentProps {
  filePath: string;
  onRecordingComplete: () => void;
}

const getColors = (theme: Record<string, string>) => ({
  default: theme['border-basic-color-2'],
  lighter: theme['border-basic-color-1'],
  recording: theme['border-danger-color-4'],
  played: theme['border-primary-color-1'],
})

export const getRecordingPath = (fileName: string) => Platform.select({
  ios: `${fileName}.m4a`,
  android: `sdcard/${fileName}.mp4`,
  default: `${fileName}.m4a`
});

class AudioRecorder extends Component<Props, State> {
  private audioRecorderPlayer: AudioRecorderPlayer;

  constructor(props: Props) {
    super(props);
    this.state = {
      isPlaying: false,
      isRecording: false,
      isPlayingPaused: false,
      hasRecorded: false,
      isLoggingIn: false,
      recordSecs: 0,
      currentPositionSec: 0,
      currentDurationSec: 0,
      playTime: '00:00:00',
      duration: '00:00:00',
    };


    this.audioRecorderPlayer = new AudioRecorderPlayer();
    try {
      this.audioRecorderPlayer.setSubscriptionDuration(0.09); // optional. Default is 0.1
    } catch (err) {
      logger.error('failed to initialize audio', err);
    }
  }

  public render() {
    let playWidth =
      (this.state.currentPositionSec / this.state.currentDurationSec) *
      (screenWidth - 56 * ratio);
    if (!playWidth) playWidth = 0;
    const { eva } = this.props;
    const { isRecording, isPlaying, isPlayingPaused, hasRecorded } = this.state;
    const colors = getColors(eva?.theme || {});
    return (
      <Card
        appearance={'filled'}
        style={[styles.container, { backgroundColor: colors.default, margin: 3 }]}
        status={isRecording ? 'danger' : (isPlaying ? 'info' : 'basic')}
      >
        <Row>
          <ButtonGroup size="small" appearance="filled" status="basic">
            <Button
              disabled={isRecording || isPlaying || isPlayingPaused}
              accessoryLeft={
                (props) => React.createElement(ThemedIcon('circle'), { ...props, solid: true })
              }
              onPress={this.onStartRecord}
            />
            <Button
              disabled={isRecording || !hasRecorded}
              accessoryLeft={isPlaying ? ThemedIcon('pause-circle') : ThemedIcon('play-circle')}
              onPress={isPlaying ?
                this.onPausePlay : (isPlayingPaused ?
                  this.onResumePlay : this.onStartPlay)}
            />
            <Button
              disabled={!isRecording && !isPlaying}
              accessoryLeft={ThemedIcon('stop')}
              onPress={isRecording ? this.onStopRecord : this.onStopPlay}
            />
          </ButtonGroup>
        </Row>
        <Row>
          <Text>
            {this.state.playTime} / {this.state.duration}
          </Text>
        </Row>
        <Row>
          <TouchableOpacity
            style={styles.viewBarWrapper}
            onPress={this.onStatusPress}
          >
            <View
              style={[
                styles.viewBar,
                { backgroundColor: colors.lighter }
              ]}
            >
              <View
                style={[
                  styles.viewBarPlay,
                  { width: playWidth, backgroundColor: colors.played }
                ]}
              />
            </View>
          </TouchableOpacity>
        </Row>
      </Card>
    );
  }

  private onStatusPress = (e: any) => {
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
      this.audioRecorderPlayer.seekToPlayer(addSecs);
      console.log(`addSecs: ${addSecs}`);
    } else {
      const subSecs = Math.round(currentPosition - 1000);
      this.audioRecorderPlayer.seekToPlayer(subSecs);
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
    console.log('audioSet', audioSet);
    this.setState({
      hasRecorded: true,
      isRecording: true,
      playTime: '00:00:00',
      currentPositionSec: 0,
    });
    const { filePath } = this.props;
    const uri = await this.audioRecorderPlayer.startRecorder(filePath, audioSet);
    this.audioRecorderPlayer.addRecordBackListener((e: any) => {
      const recordTime = this.audioRecorderPlayer.mmssss(
        Math.floor(e.current_position),
      );
      this.setState({
        duration: recordTime,
        recordSecs: e.current_position,
      });
    });
    console.log(`uri: ${uri}`);
  };

  private onStopRecord = async () => {
    const result = await this.audioRecorderPlayer.stopRecorder();
    this.audioRecorderPlayer.removeRecordBackListener();
    this.setState({
      recordSecs: 0,
      playTime: '00:00:00',
      currentPositionSec: 0,
      isRecording: false,
    });
    const { onRecordingComplete } = this.props;
    onRecordingComplete();
    console.log(result);
  };

  private onStartPlay = async () => {
    console.log('onStartPlay');
    this.setState({ isPlaying: true });
    const { filePath } = this.props;
    const msg = await this.audioRecorderPlayer.startPlayer(filePath);
    this.audioRecorderPlayer.setVolume(1.0);
    console.log(msg);
    this.audioRecorderPlayer.addPlayBackListener((e: any) => {
      const update = {
        currentPositionSec: e.current_position,
        currentDurationSec: e.duration,
        playTime: this.audioRecorderPlayer.mmssss(
          Math.floor(e.current_position),
        ),
        duration: this.audioRecorderPlayer.mmssss(Math.floor(e.duration)),
        isPlaying: true,
      }
      if (e.current_position === e.duration) {
        console.log('finished');
        this.audioRecorderPlayer.stopPlayer();
        update.isPlaying = false
      }
      this.setState(update);
    });
  };

  private onPausePlay = async () => {
    this.setState({ isPlaying: false, isPlayingPaused: true });
    await this.audioRecorderPlayer.pausePlayer();
  };

  private onResumePlay = async () => {
    this.setState({ isPlaying: true, isPlayingPaused: false });
    await this.audioRecorderPlayer.resumePlayer();
  };

  private onStopPlay = async () => {
    console.log('onStopPlay');
    this.setState({ isPlaying: false, isPlayingPaused: false });
    this.audioRecorderPlayer.stopPlayer();
    this.audioRecorderPlayer.removePlayBackListener();
  };
}

export default withStyles(AudioRecorder);
