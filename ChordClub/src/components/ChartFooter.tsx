import React from 'react';
import { ViewProps, StyleSheet, View } from 'react-native';
import { ThemedIcon } from './FontAwesomeIcons';
import { Chart } from '../types';
import ChartReactions from './ChartReactions';
import { Button } from '@ui-kitten/components';

interface Props {
  chart: Chart;
  viewProps: ViewProps | undefined;
  openImage: () => void;
  next?: () => void;
}

export const ChartFooter = ({ viewProps, chart, openImage, next }: Props) => (
  <View {...viewProps} style={[viewProps?.style || {}, styles.headerAndFooter]}>
    <ChartReactions chart={chart} />
    <View style={styles.rightControls}>
      {chart.imageURL &&
        <Button
          appearance="ghost"
          status="basic"
          onPress={openImage}
          accessoryLeft={ThemedIcon('music')}
        />
      }
      <Button
        appearance={'ghost'}
        status={'basic'}
        size={'small'}
        onPress={next}
        accessoryLeft={ThemedIcon('arrow-circle-right')}
      />
    </View>
  </View>
);


const styles = StyleSheet.create({
  rightControls: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAndFooter: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
});
