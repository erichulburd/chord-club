import React from 'react';
import {
  Audioable,
  withAudioPlayerContext,
  AudioPlayerContextProps,
} from './AudioPlayerProvider';
import {View, StyleSheet} from 'react-native';
import {Button, withStyles, ThemedComponentProps} from '@ui-kitten/components';
import {ThemedIcon} from './FontAwesomeIcons';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {getCalRatio} from '../util/screen';

interface ManualProps {
  audio: Audioable;
}

interface Props
  extends AudioPlayerContextProps,
    ManualProps,
    ThemedComponentProps {}

const getColors = (theme: Record<string, string>) => ({
  default: theme['border-basic-color-2'],
  lighter: theme['border-basic-color-2'],
  recording: theme['border-danger-color-4'],
  played: theme['border-primary-color-1'],
});

const AudioPlayer = ({audio, audioCtx, eva}: Props) => {
  const dims = getCalRatio();
  let playWidth = 0;
  if (audioCtx.isPlaying(audio.audioURL) || audioCtx.isPaused(audio.audioURL)) {
    playWidth = audioCtx.playRatio() * (dims.width - 56 * dims.ratio);
    if (!playWidth) {
      playWidth = 0;
    }
  }
  const colors = getColors(eva?.theme || {});
  let actionIcon = ThemedIcon('play');
  let action = () => audioCtx.play(audio);
  if (audioCtx.isPlaying(audio.audioURL)) {
    if (audioCtx.isPaused(audio.audioURL)) {
      action = () => audioCtx.resume();
    } else {
      actionIcon = ThemedIcon('pause');
      action = () => audioCtx.pause();
    }
  }
  return (
    <View style={styles.container}>
      <View style={styles.innerContainer}>
        <View>
          <Button
            appearance="ghost"
            status="success"
            size="small"
            accessoryLeft={actionIcon}
            onPress={action}
          />
        </View>
        <View>
          <TouchableOpacity
            style={styles.viewBarWrapper}
            onPress={audioCtx.seek}>
            <View style={[styles.viewBar, {backgroundColor: colors.lighter}]}>
              <View
                style={[
                  styles.viewBarPlay,
                  {width: playWidth, backgroundColor: colors.played},
                ]}
              />
            </View>
          </TouchableOpacity>
        </View>
        <View />
      </View>
    </View>
  );
};

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
  viewBarWrapper: {
    marginTop: 10 * initialDims.ratio,
    marginHorizontal: 10 * initialDims.ratio,
    display: 'flex',
    alignItems: 'stretch',
    flexDirection: 'column',
    width: '100%',
  },
  viewBar: {
    height: 20 * initialDims.ratio,
    width: '100%',
  },
  viewBarPlay: {
    height: 20 * initialDims.ratio,
    width: 0,
  },
});

export default withAudioPlayerContext<ManualProps>(withStyles(AudioPlayer));
