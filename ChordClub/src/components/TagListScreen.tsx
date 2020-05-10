import React from 'react';
import {AppScreen, Screens} from './AppScreen';
import { TagList } from './TagList';

export const TagListScreen = () => (
  <AppScreen title={Screens.Tags}>
    <TagList />
  </AppScreen>
);
