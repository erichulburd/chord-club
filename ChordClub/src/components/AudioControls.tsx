import React, {useState} from 'react';
import {View, StyleSheet} from 'react-native';
import {getCalRatio} from '../util/screen';
import {Button} from '@ui-kitten/components';
import {AudioPlayerProgress} from './AudioPlayerProgress';
import {ThemedIcon} from './FontAwesomeIcons';
import {AudioDuration} from './AudioDuration';

export interface AudioAction {
  iconName: string;
  status?: string;
  onPress?: () => void;
}

interface Props {
  currentPositionMs: number;
  durationMs: number;
  actions: AudioAction[];
  seek?: (positionMs: number) => void;
}

export const AudioControls = ({
  currentPositionMs,
  durationMs,
  seek,
  actions,
}: Props) => {
  const [width, setWidth] = useState(0);
  return (
    <View style={styles.container}>
      <View
        style={styles.rows}
        onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
        <View style={styles.innerContainer}>
          <AudioPlayerProgress
            width={width}
            seek={seek}
            playPosition={currentPositionMs}
            playDuration={durationMs}
          />
        </View>
        <View style={styles.innerContainer}>
          <View style={styles.actions}>
            {actions.map(({onPress, status, iconName}, i) => (
              <Button
                key={`audioAction-${i}`}
                appearance="ghost"
                status={status || 'basic'}
                accessoryLeft={ThemedIcon(iconName, {solid: true})}
                onPress={onPress}
              />
            ))}
          </View>
          <View>
            <AudioDuration
              currentPositionMs={currentPositionMs}
              durationMs={durationMs}
            />
          </View>
        </View>
      </View>
    </View>
  );
};

const initialDims = getCalRatio();
const styles = StyleSheet.create({
  container: {
    margin: 10,
    display: 'flex',
  },
  rows: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  innerContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actions: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
});
