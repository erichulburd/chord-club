import React, {PropsWithChildren, useEffect, useContext, useState} from 'react';
import {SafeAreaView, StyleSheet} from 'react-native';
import Title, {MenuItemData} from './Title';
import {Divider, Layout, Button} from '@ui-kitten/components';
import {NavigationHelpers, RouteProp, useNavigation,  useNavigationState} from '@react-navigation/native';
import {DrawerNavigationEventMap} from '@react-navigation/drawer/lib/typescript/src/types';
import {ChartType, Chart} from '../types';
import { ContentContainer } from './ContentContainer';
import { AuthContext } from './UserContext';
import { LinkHandler } from './LinkHandler';

interface Props {
  title?: string;
  menuItems?: MenuItemData[];
  more?: React.ReactNode;
}

export interface ScreenProps {
  navigation: NavigationHelpers<
    Record<string, object | undefined>,
    DrawerNavigationEventMap
  >;
}

export enum Screens {
  // Chords = 'Chords',
  // ChordFlashcards = 'Chord Flashcards',
  Progressions = 'Listen',
  RecordAProgression = 'Record',
  Account = 'Account',
  Login = 'Login',
  Logout = 'Logout',
  EditChart = 'Edit Chart',
  Tags = 'Tags',
  Blank = 'Blank'
}

interface AppParamList {
  Progressions: {};
  RecordAProgression: {
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
  title = 'Chord Club',
  menuItems,
  children,
  more,
}: PropsWithChildren<Props>) => {
  const userCtx = useContext(AuthContext);
  const navigation = useNavigation();
  const route = useNavigationState(state => state.routes[state.index]);

  useEffect(() => {
    const isLoggedIn = Boolean(userCtx.authState.token);
    if (!isLoggedIn && route.name !== Screens.Login) {
      navigation.navigate(Screens.Login);
    } else if (isLoggedIn && route.name === Screens.Login) {
      navigation.navigate(Screens.Progressions);
    }
  }, [route.name, userCtx]);

  return (
    <SafeAreaView style={styles.layout}>
      <Title title={title} menuItems={menuItems} />
      <Divider />
      <Layout style={styles.layout}>
        <ContentContainer>
          {children}
        </ContentContainer>
        {more}
      </Layout>
      <LinkHandler />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  layout: {
    flex: 1,
    overflow: 'hidden',
  },
});
