import React from 'react';
import { FlashcardSettings } from '../util/flashcards';
import { View, ViewProps, StyleSheet } from 'react-native';
import { CheckBox, Card, Button, Text } from '@ui-kitten/components';

interface Props {
  settings: FlashcardSettings;
  updateFlashcardSettings: (settings: FlashcardSettings) => void;
  done: () => void;
}

export const FlashcardsSettings = ({
  settings, updateFlashcardSettings, done,
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
          checked={settings.tone}
          onChange={(checked) => updateFlashcardSettings({ ...settings, tone: checked })}
        >Tone</CheckBox>
        <CheckBox
          checked={settings.quality}
          onChange={(checked) => updateFlashcardSettings({ ...settings, quality: checked })}
        >Quality</CheckBox>
        <CheckBox
          checked={settings.extensions}
          onChange={(checked) => updateFlashcardSettings({ ...settings, extensions: checked })}
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
