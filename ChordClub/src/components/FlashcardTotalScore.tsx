import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { Card, Button, Text } from '@ui-kitten/components';

interface Props {
  scores: (boolean | undefined)[];
  reset: () => void;
}

export const FlashcardTotalScore = ({
  reset, scores,
}: Props) => {
  const Footer = (props: ViewProps | undefined) => (
    <View {...props}>
      <Button
        size="giant"
        appearance="outline"
        onPress={reset}
      >Go again!</Button>
    </View>
  );
  const score = getTotalScore(scores);
  let status = 'success';
  if (score < 50) {
    status = 'danger'
  } else if (score < 80) {
    status = 'warning';
  }
  return (
    <Card
      disabled
      status={status}
      footer={Footer}
    >
      <View style={styles.score}>
        <Text category="h1">{score.toString()}%</Text>
      </View>
    </Card>

  );
};

const getTotalScore = (scores: (boolean | undefined)[]) => {
  const correctCt = scores.reduce((prev, score) => prev + (score === true ? 1 : 0), 0);
  const total = scores.reduce((prev) => prev + 1, 0);
  return Math.round(100 * correctCt / total);
};

const styles = StyleSheet.create({
  score: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  }
})
