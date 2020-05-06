import React from 'react';
import {Button} from '@ui-kitten/components';
import {View, StyleSheet} from 'react-native';
import { Note } from '../types';
import { getAnswerStatus, getAnswerAppearance } from '../util/flashcards';
import { displayNote } from '../util/strings';

interface Props {
  expectedAnswer: Note;
  userAnswer: Note | undefined;
  revealed: boolean;
  onSelect: (tone: Note) => void;
}

const options = Object.values(Note) as Note[];

export const FlashcardTone = ({
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
          {displayNote(value)}
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
