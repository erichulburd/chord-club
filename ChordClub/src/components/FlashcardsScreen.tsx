import React from 'react';
import ChartQueryView from './ChartQueryView';
import {Screens} from './AppScreen';
import { Flashcards } from './Flashcards';

export const FlashcardsScreen = () => {
  return (
    <ChartQueryView
      title={Screens.ChordFlashcards}
      settingsPath={'flashcards'}
      renderQueryResults={({query}) => (
        <Flashcards
          query={query}
        />
      )}
    />
  );
};

export default FlashcardsScreen;
