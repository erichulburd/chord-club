import React, {PropsWithChildren} from 'react';
import {SafeAreaView, StyleSheet} from 'react-native';
import Title, {MenuItemData} from './Title';
import {Divider, Layout} from '@ui-kitten/components';
import { NavigationHelpers } from '@react-navigation/native';
import { DrawerNavigationEventMap } from '@react-navigation/drawer/lib/typescript/src/types';

interface Props {
  title: string;
  menuItems?: MenuItemData[];
}

export interface ScreenProps {
  navigation: NavigationHelpers<Record<string, object | undefined>, DrawerNavigationEventMap>;
}

export enum Screens {
  Chords = 'Chords',
  ChordFlashcards = 'Chord Flashcards',
  Progressions = 'Progressions',
  CreateAChart = 'Create a Chart',
  Account = 'Account',
  Logout = 'Logout',
}

export const AppScreen = ({
  title,
  menuItems,
  children,
}: PropsWithChildren<Props>) => {
  return (
    <SafeAreaView style={styles.layout}>
      <Title title={title} menuItems={menuItems} />
      <Divider />
      <Layout style={styles.layout}>{children}</Layout>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  layout: {
    flex: 1,
    overflow: 'hidden',
  },
});
