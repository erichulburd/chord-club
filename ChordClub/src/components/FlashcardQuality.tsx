import React from 'react';
import {Button} from '@ui-kitten/components';
import {View, StyleSheet} from 'react-native';
import { ChartQuality } from '../types';
import capitalize from 'lodash/capitalize';
import { getAnswerStatus, getAnswerAppearance } from '../util/flashcards';

interface Props {
  expectedAnswer: ChartQuality;
  userAnswer: ChartQuality | undefined;
  revealed: boolean;
  onSelect: (chartQuality: ChartQuality) => void;
}

const options = [
  ChartQuality.Major, ChartQuality.Minor,
  ChartQuality.Sus2, ChartQuality.Sus4,
  ChartQuality.Diminished, ChartQuality.Augmented,
];

export const FlashcardQuality = ({
  userAnswer, expectedAnswer, revealed, onSelect,
}: Props) => {
  return (
    <View style={styles.container}>
      {options.map((value) => (
        <Button
          key={value}
          size={'small'}
          style={styles.button}
          status={getAnswerStatus(value, userAnswer, expectedAnswer, revealed)}
          appearance={getAnswerAppearance(value, userAnswer)}
          onPress={() => onSelect(value)}
        >
          {capitalize(value)}
        </Button>
      ))}
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  button: {
    margin: 5,
  },
});
