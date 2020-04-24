import React from 'react';
import { Button, ButtonGroup } from '@ui-kitten/components';
import { ChartType } from '../../types';
import { ThemedIcon } from '../FontAwesomeIcons';

interface Props {
  chartType: ChartType | undefined;
  onChange: (chartType: ChartType) => void;
}

export const ChartTypeBG = ({ chartType, onChange }: Props) => {

  return (
    <ButtonGroup appearance='outline' status='info' size="small">
      <Button
        onPress={() =>
          chartType !== ChartType.Chord && onChange(ChartType.Chord)
        }
        accessoryLeft={chartType === ChartType.Chord ? ThemedIcon('check-square') : ThemedIcon('square')}
      >Chord</Button>
      <Button
        onPress={() =>
          chartType !== ChartType.Progression && onChange(ChartType.Progression)
        }
        accessoryLeft={chartType === ChartType.Progression ? ThemedIcon('check-square') : ThemedIcon('square')}
      >Progression</Button>
    </ButtonGroup>
  )
};
