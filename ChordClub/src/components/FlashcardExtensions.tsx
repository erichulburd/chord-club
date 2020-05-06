import React from 'react';
import {Button} from '@ui-kitten/components';
import {View, StyleSheet} from 'react-native';
import { Extension } from '../types';
import { getAnswerStatus, getAnswerAppearance } from '../util/flashcards';
import { displayExtension } from '../util/strings';

interface Props {
  extensions: Extension[];
  expectedAnswer: Extension[];
  userAnswer: Extension[];
  revealed: boolean;
  onSelect: (ext: Extension) => void;
}

export const FlashcardExtensions = ({
  userAnswer, expectedAnswer, revealed, onSelect, extensions,
}: Props) => {
  return (
    <View style={styles.container}>
      {extensions.map((value) => (
        <Button
          key={value.id}
          size={'small'}
          style={styles.button}
          status={getAnswerStatus(value, userAnswer, expectedAnswer, revealed)}
          appearance={getAnswerAppearance(value, userAnswer)}
          onPress={() => onSelect(value)}
        >
          {displayExtension(value)}
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
