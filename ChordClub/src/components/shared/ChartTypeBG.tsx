import React from 'react';
import { Button, ButtonGroup } from '@ui-kitten/components';
import { ChartType } from '../../types';
import { ThemedIcon } from '../FontAwesomeIcons';

interface Props {
  chartTypes: ChartType[];
  onChange: (chartType: ChartType) => void;
}

export const ChartTypeBG = ({ chartTypes, onChange }: Props) => {

  return (
    <ButtonGroup appearance='outline' status='info' size="small">
      <Button
        onPress={() =>
          !chartTypes.includes(ChartType.Chord) && onChange(ChartType.Chord)
        }
        accessoryLeft={chartTypes.includes(ChartType.Chord) ? ThemedIcon('check-square') : ThemedIcon('square')}
      >Chord</Button>
      <Button
        onPress={() =>
          !chartTypes.includes(ChartType.Progression) && onChange(ChartType.Progression)
        }
        accessoryLeft={chartTypes.includes(ChartType.Progression) ? ThemedIcon('check-square') : ThemedIcon('square')}
      >Progression</Button>
    </ButtonGroup>
  )
};
