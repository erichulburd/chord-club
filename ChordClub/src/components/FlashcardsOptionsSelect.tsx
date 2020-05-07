import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { CheckBox, Card, Button, Text } from '@ui-kitten/components';
import { FlashcardOptions } from '../util/settings';
import { UserConsumerProps, withUser } from './UserContext';

interface ManualProps {
  options: FlashcardOptions;
  done: () => void;
}

interface Props extends UserConsumerProps, ManualProps {}

const FlashcardsOptionsSelect = ({
  options, done, userCtx,
}: Props) => {
  const Footer = (props: ViewProps | undefined) => (
    <View {...props}>
      <Button
        size="giant"
        appearance="outline"
        onPress={done}
      >Begin!</Button>
    </View>
  );
  const updateFlashcardOptions = (options: FlashcardOptions) => {
    userCtx.updateSettings('flashcards', { options });
  }
  return (
    <Card
      disabled
      status="basic"
      footer={Footer}
    >
      <View style={styles.paragraph}>
        <Text category="p1">
          Use flashcards to have fun while learning to identify chords by hearing.
        </Text>
      </View>
      <View style={styles.paragraph}>
        <Text category="p1">
          Use the top right menu to filter the chords to be quizzed on.
        </Text>
      </View>
      <View style={styles.paragraph}>
        <Text category="p1">
          Choose which options you want to be tested on below.
        </Text>
      </View>
      <View style={styles.settings}>
        <CheckBox
          checked={options.tone}
          onChange={(checked) => updateFlashcardOptions({ ...options, tone: checked })}
        >Tone</CheckBox>
        <CheckBox
          checked={options.quality}
          onChange={(checked) => updateFlashcardOptions({ ...options, quality: checked })}
        >Quality</CheckBox>
        <CheckBox
          checked={options.extensions}
          onChange={(checked) => updateFlashcardOptions({ ...options, extensions: checked })}
        >Extensions</CheckBox>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  settings: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  paragraph: {
    marginBottom: 10
  }
})

export default withUser<ManualProps>(FlashcardsOptionsSelect);
