import React from 'react';
import ChartQueryView from './ChartQueryView';
import {Screens} from './AppScreen';
import { Flashcards } from './Flashcards';
import { FlashcardViewSetting } from 'src/util/settings';

export const FlashcardsScreen = () => {
  return (
    <ChartQueryView
      expandable={false}
      reversable={false}
      title={Screens.ChordFlashcards}
      settingsPath={'flashcards'}
      renderQueryResults={({query, options}: FlashcardViewSetting) => (
        <Flashcards
          query={query}
          options={options}
        />
      )}
    />
  );
};

export default FlashcardsScreen;
