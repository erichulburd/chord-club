import React from 'react';
import {AppScreen, ScreenProps, Screens} from './AppScreen';
import ChartCreator from './ChartCreator';

export const ChartCreatorScreen = ({navigation}: ScreenProps) => (
  <AppScreen title={Screens.CreateAChart}>
    <ChartCreator close={() => navigation.goBack()} />
  </AppScreen>
);
