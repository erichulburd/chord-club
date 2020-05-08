import React, { useState, useCallback } from 'react';
import ChordList from './ChordList';
import ChartQueryView from './ChartQueryView';
import {Screens} from './AppScreen';
import { ChartViewSetting } from '../util/settings';
import { NavigationHelpers, useFocusEffect } from '@react-navigation/native';
import { DrawerNavigationEventMap } from '@react-navigation/drawer/lib/typescript/src/types';
import uuid from 'react-native-uuid';

interface Props {
  navigation: NavigationHelpers<Record<string, object | undefined>, DrawerNavigationEventMap>;
}

export const ChordListScreen = ({ navigation }: Props) => {
  const [mountID, setMountID] = useState(uuid.v4());

  useFocusEffect(useCallback(() => {
    setMountID(uuid.v4());
  }, []));
  return (
    <ChartQueryView
      title={Screens.Chords}
      settingsPath={'chords'}
      renderQueryResults={({query, compact}: ChartViewSetting) => (
        <ChordList
          mountID={mountID}
          compact={compact === null || compact === undefined ? false : compact}
          query={query}
          editChart={(chart) => undefined /* TODO */}
        />
      )}
    />
  );
};

export default ChordListScreen;
