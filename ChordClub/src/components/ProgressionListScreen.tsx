import React from 'react';
import ProgressionList from './ProgressionList';
import {withUser} from './UserContext';
import ChartQueryView from './ChartQueryView';
import {Screens} from './AppScreen';
import { ChartViewSetting } from '../util/settings';

export const ProgressionListScreen = () => {
  return (
    <ChartQueryView
      title={Screens.Progressions}
      settingsPath={'progressions'}
      renderQueryResults={({query, compact}: ChartViewSetting) => (
        <ProgressionList
          query={query}
          compact={compact}
          editChart={(chart) => undefined /* TODO */}
        />
      )}
    />
  );
};

export default withUser(ProgressionListScreen);
