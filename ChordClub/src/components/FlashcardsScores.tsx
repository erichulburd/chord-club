import React from 'react';
import { FlatList } from 'react-native-gesture-handler';
import { Button } from '@ui-kitten/components';
import { ThemedIcon } from './FontAwesomeIcons';

interface ScoreProps {
  correct: (boolean | undefined);
  isCurrent: boolean;
}

const Score = ({ correct, isCurrent }: ScoreProps) => {
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
}

interface Props {
  currentIndex: number | undefined;
  scores: (boolean | undefined)[];
}

export const FlashcardsScores = ({ scores, currentIndex }: Props) => {
  const scoresWithIndex: [(boolean | undefined), number][] = scores.map((s, i) => [s, i]);
  return (
    <FlatList
      horizontal
      data={scoresWithIndex}
      keyExtractor={([_correct, index]) => index.toString()}
      renderItem={(item) => (<Score isCurrent={item.item[1] === currentIndex} correct={item.item[0]} />)}
    />
  )
}
