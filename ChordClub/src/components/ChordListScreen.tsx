import React, { useState, useCallback } from 'react';
import ChordList from './ChordList';
import ChartQueryView from './ChartQueryView';
import {Screens} from './AppScreen';
import { ChartViewSetting } from '../util/settings';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import uuid from 'react-native-uuid';
import { Chart } from '../types';

export const ChordListScreen = () => {
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
      title={Screens.Chords}
      settingsPath={'chords'}
      renderQueryResults={({query, compact}: ChartViewSetting) => (
        <ChordList
          mountID={mountID}
          compact={compact === null || compact === undefined ? false : compact}
          query={query}
          editChart={editChart}
        />
      )}
    />
  );
};

export default ChordListScreen;
