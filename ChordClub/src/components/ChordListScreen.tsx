import React from 'react';
import ChordList from './ChordList';
import ChartQueryView from './ChartQueryView';
import { Screens } from './AppScreen';

export const ChordListScreen = () => {
  return (
    <ChartQueryView
      title={Screens.Chords}
      settingsPath={'chords'}
      renderQueryResults={({ query, compact }) => (
        <ChordList
          compact={(compact === null || compact === undefined) ? false : compact}
          query={query}
          editChart={(chart) => undefined /* TODO */}
        />
      )}
    />
  );
};

export default ChordListScreen;
