import React, { useState, useCallback } from 'react';
import ChartQueryView from './ChartQueryView';
import {Screens} from './AppScreen';
import {Flashcards} from './Flashcards';
import {FlashcardViewSetting} from '../util/settings';
import uuid from 'react-native-uuid';
import { useFocusEffect } from '@react-navigation/native';

export const FlashcardsScreen = () => {
  const [mountID, setMountID] = useState(uuid.v4());

  useFocusEffect(
    useCallback(() => {
      setMountID(uuid.v4());
    }, []),
  );
  return (
    <ChartQueryView
      expandable={false}
      reversable={false}
      title={Screens.ChordFlashcards}
      settingsPath={'flashcards'}
      renderQueryResults={({query, options}: FlashcardViewSetting) => (
        <Flashcards query={query} mountID={mountID} options={options} />
      )}
    />
  );
};

export default FlashcardsScreen;
