import React from 'react';
import {AppScreen} from './AppScreen';
import { View } from 'react-native';

export const BlankScreen = () => {
  return (
    <AppScreen menuItems={[]}>
      <View />
    </AppScreen>
  );
};
