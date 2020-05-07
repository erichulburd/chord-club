import React, {PropsWithChildren} from 'react';
import {SafeAreaView, StyleSheet} from 'react-native';
import Title, {MenuItemData} from './Title';
import {Divider, Layout} from '@ui-kitten/components';
import {ChordClubShim} from '../../types/ChordClubShim';

interface Props {
  title: string;
  menuItems?: MenuItemData[];
}

export interface ScreenProps {
  navigation: ChordClubShim.Navigation;
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
