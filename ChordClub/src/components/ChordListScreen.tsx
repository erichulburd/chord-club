import React from 'react';
import ChordList from './ChordList';
import ChartQueryView from './ChartQueryView';
import {Screens} from './AppScreen';
import { ChartViewSetting } from '../util/settings';

export const ChordListScreen = () => {
  return (
    <ChartQueryView
      title={Screens.Chords}
      settingsPath={'chords'}
      renderQueryResults={({query, compact}: ChartViewSetting) => (
        <ChordList
          compact={compact === null || compact === undefined ? false : compact}
          query={query}
          editChart={(chart) => undefined /* TODO */}
        />
      )}
    />
  );
};

export default ChordListScreen;
