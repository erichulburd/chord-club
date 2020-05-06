import React from 'react';
import { FlashcardSettings } from '../util/flashcards';
import { View } from 'react-native';
import { CheckBox } from '@ui-kitten/components';

interface Props {
  settings: FlashcardSettings;
  setFlashcardSettings: (settings: FlashcardSettings) => void;
}

export const FlashcardsSettings = ({
  settings, setFlashcardSettings
}: Props) => {
  return (
    <View>
      <CheckBox
        checked={settings.tone}
        onChange={(checked) => setFlashcardSettings({ ...settings, tone: checked })}
      >Tone</CheckBox>
      <CheckBox
        checked={settings.quality}
        onChange={(checked) => setFlashcardSettings({ ...settings, quality: checked })}
      >Quality</CheckBox>
      <CheckBox
        checked={settings.extensions}
        onChange={(checked) => setFlashcardSettings({ ...settings, extensions: checked })}
      >Extensions</CheckBox>
    </View>
  );
};
