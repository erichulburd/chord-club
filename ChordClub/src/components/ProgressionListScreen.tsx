import React from 'react';
import ProgressionList from './ProgressionList';
import {withUser} from './UserContext';
import ChartQueryView from './ChartQueryView';
import {Screens} from './AppScreen';

export const ProgressionListScreen = () => {
  return (
    <ChartQueryView
      title={Screens.Progressions}
      settingsPath={'progressions'}
      renderQueryResults={({query}) => (
        <ProgressionList
          query={query}
          editChart={(chart) => undefined /* TODO */}
        />
      )}
    />
  );
};

export default withUser(ProgressionListScreen);
