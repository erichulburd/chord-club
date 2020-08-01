import React, {useCallback, useState} from 'react';
import {AppScreen, ScreenProps, Screens} from './AppScreen';
import ChartCreator from './ChartCreator';
import {useFocusEffect} from '@react-navigation/native';
import uuid from 'react-native-uuid';

export const ChartCreatorScreen = ({navigation}: ScreenProps) => {
  const [mountID, setMountID] = useState(uuid.v4());

  useFocusEffect(
    useCallback(() => {
      setMountID(uuid.v4());
    }, []),
  );
  return (
    <AppScreen title={Screens.RecordAProgression}>
      <ChartCreator mountID={mountID} close={() => navigation.goBack()} />
    </AppScreen>
  );
};
