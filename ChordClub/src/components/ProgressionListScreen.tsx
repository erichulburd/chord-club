import React, { useState, useCallback } from 'react';
import ProgressionList from './ProgressionList';
import {withUser} from './UserContext';
import ChartQueryView from './ChartQueryView';
import {Screens} from './AppScreen';
import { ChartViewSetting } from '../util/settings';
import uuid from 'react-native-uuid';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Chart } from 'src/types';

export const ProgressionListScreen = () => {
  const [mountID, setMountID] = useState(uuid.v4());

  useFocusEffect(useCallback(() => {
    setMountID(uuid.v4());
  }, []));

  const navigation = useNavigation();
  const editChart = (chart: Chart) => {
    navigation.navigate(Screens.EditChart, { chart  });
  }
  return (
    <ChartQueryView
      title={Screens.Progressions}
      settingsPath={'progressions'}
      renderQueryResults={({query, compact}: ChartViewSetting) => (
        <ProgressionList
          mountID={mountID}
          query={query}
          compact={compact}
          editChart={editChart}
        />
      )}
    />
  );
};

export default withUser(ProgressionListScreen);
