import React from 'react';
import { AppScreen, ScreenProps } from './AppScreen';
import ChartCreator from './ChartCreator';



export const ChartCreatorScreen = ({ navigation }: ScreenProps) => (
  <AppScreen title={'New Chart'}>
    <ChartCreator close={() => navigation.goBack()} />
  </AppScreen>
)
