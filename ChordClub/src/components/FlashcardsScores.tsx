import React from 'react';
import {Button} from '@ui-kitten/components';
import {ThemedIcon} from './FontAwesomeIcons';
import {View, StyleSheet} from 'react-native';

interface ScoreProps {
  correct: boolean | undefined;
  isCurrent: boolean;
}

const Score = ({correct, isCurrent}: ScoreProps) => {
  let status = 'basic';
  let iconName = 'circle';
  if (correct === true) {
    status = 'success';
    iconName = 'check-circle';
  } else if (correct === false) {
    status = 'danger';
    iconName = 'times-circle';
  }
  return (
    <Button
      appearance={isCurrent ? 'outline' : 'ghost'}
      status={status}
      size="tiny"
      accessoryLeft={ThemedIcon(iconName)}
    />
  );
};

interface Props {
  currentIndex: number | undefined;
  scores: (boolean | undefined)[];
}

export const FlashcardsScores = ({scores, currentIndex}: Props) => {
  return (
    <View style={styles.container}>
      {scores.map((score, i) => (
        <Score key={i} isCurrent={i === currentIndex} correct={score} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    flexWrap: 'wrap',
    width: '100%',
  },
});
