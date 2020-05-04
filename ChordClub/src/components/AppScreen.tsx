import React, { PropsWithChildren } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import Title from './Title';
import { Divider, Layout } from '@ui-kitten/components';
import { ChordClubShim } from '../../types/ChordClubShim'

interface Props {
  title: string;
}

export interface ScreenProps {
  navigation: ChordClubShim.Navigation;
}

export enum Screens {
  ChordList = 'Chord List',
  ChordFlashcards = 'Chord Flashcards',
  ProgressionList = 'Progression List',
  CreateAChart = 'Create a Chart',
  Settings = 'Settings',
}

export const AppScreen = ({ title, children }: PropsWithChildren<Props>) => {
  return (
    <SafeAreaView style={styles.layout}>
      <Title title={title} />
      <Divider />
      <Layout style={styles.layout}>
        {children}
      </Layout>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  layout: {
    flex: 1,
    overflow: 'hidden'
  }
})
