import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import {
  createDrawerNavigator,
  DrawerContentComponentProps,
  DrawerContentOptions,
} from '@react-navigation/drawer';
import ChordListScreen from './ChordListScreen';
import {
  Drawer, DrawerItem, IndexPath,
  Layout, Divider, Text,
} from '@ui-kitten/components';
import { SafeAreaView, View } from 'react-native';
import Title from './Title';
import { ChartCreatorScreen } from './ChartCreatorScreen';
import { Screens } from './AppScreen';

const { Navigator, Screen } = createDrawerNavigator();

const DrawerContent = ({ navigation, state }: DrawerContentComponentProps<DrawerContentOptions>) => (
    <Drawer
      selectedIndex={new IndexPath(state.index)}
      onSelect={index => navigation.navigate(state.routeNames[index.row])}
    >
      <SafeAreaView>
        <DrawerItem title={Screens.ChordList} />
        <DrawerItem title={Screens.ChordFlashcards} />
        <DrawerItem title={Screens.ProgressionList} />
        <DrawerItem title={Screens.CreateAChart} />
        <DrawerItem title={Screens.Settings} />
      </SafeAreaView>
    </Drawer>
);

const Todo = () => {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Title />
      <Divider />
      <Layout style={{ flex: 1 }}>
        <Text category="h1">TODO</Text>
      </Layout>
    </SafeAreaView>
  );
};

export const AppNavigator = () => (
  <NavigationContainer>
    <Navigator
      drawerContent={(props) => <DrawerContent {...props} />}
      initialRouteName={Screens.ChordList}
    >
      <Screen name={Screens.ChordList} component={ChordListScreen} />
      <Screen name={Screens.ChordFlashcards} component={Todo} />
      <Screen name={Screens.ProgressionList} component={Todo} />
      <Screen name={Screens.CreateAChart} component={ChartCreatorScreen} />
      <Screen name={Screens.Settings} component={Todo} />
    </Navigator>
  </NavigationContainer>
);
