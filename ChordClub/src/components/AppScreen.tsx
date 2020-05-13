import React, {PropsWithChildren} from 'react';
import {SafeAreaView, StyleSheet} from 'react-native';
import Title, {MenuItemData} from './Title';
import {Divider, Layout} from '@ui-kitten/components';
import {NavigationHelpers, RouteProp} from '@react-navigation/native';
import {DrawerNavigationEventMap} from '@react-navigation/drawer/lib/typescript/src/types';
import {ChartType, Chart} from '../types';
import { ContentContainer } from './ContentContainer';

interface Props {
  title: string;
  menuItems?: MenuItemData[];
}

export interface ScreenProps {
  navigation: NavigationHelpers<
    Record<string, object | undefined>,
    DrawerNavigationEventMap
  >;
}

export enum Screens {
  Chords = 'Chords',
  ChordFlashcards = 'Chord Flashcards',
  Progressions = 'Progressions',
  CreateAChart = 'Create a Chart',
  Account = 'Account',
  Logout = 'Logout',
  EditChart = 'Edit Chart',
  Tags = 'Tags',
}

interface AppParamList {
  Chords: {};
  ChordFlashcards: {};
  Progressions: {};
  CreateAChart: {
    chartType?: ChartType;
  };
  Account: {};
  Logout: {};
  EditChart: {
    chart: Chart;
  };
  [key: string]: {} | undefined;
}

export type AppRouteProp<T extends keyof AppParamList> = RouteProp<
  AppParamList,
  T
>;

export const AppScreen = ({
  title,
  menuItems,
  children,
}: PropsWithChildren<Props>) => {
  return (
    <SafeAreaView style={styles.layout}>
      <Title title={title} menuItems={menuItems} />
      <Divider />
      <Layout style={styles.layout}>
        <ContentContainer>
          {children}
        </ContentContainer>
      </Layout>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  layout: {
    flex: 1,
    overflow: 'hidden',
  },
});
