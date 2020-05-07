import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {
  createDrawerNavigator,
  DrawerContentComponentProps,
  DrawerContentOptions,
} from '@react-navigation/drawer';
import ChordListScreen from './ChordListScreen';
import ProgressionListScreen from './ProgressionListScreen';
import {
  Drawer,
  DrawerItem,
  IndexPath,
  Layout,
  Divider,
  Text,
  withStyles,
  ThemedComponentProps,
} from '@ui-kitten/components';
import {SafeAreaView, View, ViewProps, StyleSheet} from 'react-native';
import Title from './Title';
import {ChartCreatorScreen} from './ChartCreatorScreen';
import {Screens} from './AppScreen';
import {ThemedIcon} from './FontAwesomeIcons';
import { FlashcardsScreen } from './FlashcardsScreen';
import { AccountScreen } from './AccountScreen';

const {Navigator, Screen} = createDrawerNavigator();

const BaseHeader = withStyles(
  (props: ThemedComponentProps & (ViewProps | undefined)) => {
    const theme = props.eva?.theme || {};
    const backgroundColor = theme['border-basic-color-1'];
    const color = theme['color-basic-500'];
    return (
      <View {...props} style={[styles.header, {backgroundColor}]}>
        <Text category="h4" style={[styles.title, {color}]}>
          Welcome to ChordClub
        </Text>
        <Divider />
      </View>
    );
  },
);

const Header = (props: ViewProps | undefined) => <BaseHeader {...props} />;

const DrawerContent = ({
  navigation,
  state,
}: DrawerContentComponentProps<DrawerContentOptions>) => (
  <Drawer
    header={Header}
    selectedIndex={new IndexPath(state.index)}
    onSelect={(index) => navigation.navigate(state.routeNames[index.row])}>
    <SafeAreaView>
      <DrawerItem accessoryLeft={ThemedIcon('list')} title={Screens.Chords} />
      <DrawerItem
        accessoryLeft={ThemedIcon('list')}
        title={Screens.Progressions}
      />
      <DrawerItem
        accessoryLeft={ThemedIcon('bolt')}
        title={Screens.ChordFlashcards}
      />
      <DrawerItem
        accessoryLeft={ThemedIcon('circle', {solid: true})}
        title={Screens.CreateAChart}
      />
      <DrawerItem accessoryLeft={ThemedIcon('user-cog')} title={Screens.Account} />
    </SafeAreaView>
  </Drawer>
);

const Todo = () => {
  return (
    <SafeAreaView style={{flex: 1}}>
      <Title />
      <Divider />
      <Layout style={{flex: 1}}>
        <Text category="h1">TODO</Text>
      </Layout>
    </SafeAreaView>
  );
};

export const AppNavigator = () => (
  <NavigationContainer>
    <Navigator
      drawerContent={(props) => <DrawerContent {...props} />}
      initialRouteName={Screens.Chords}>
      <Screen name={Screens.Chords} component={ChordListScreen} />
      <Screen name={Screens.Progressions} component={ProgressionListScreen} />
      <Screen name={Screens.ChordFlashcards} component={FlashcardsScreen} />
      <Screen name={Screens.CreateAChart} component={ChartCreatorScreen} />
      <Screen name={Screens.Account} component={AccountScreen} />
    </Navigator>
  </NavigationContainer>
);

const styles = StyleSheet.create({
  header: {
    paddingTop: 50,
    paddingLeft: 10,
    paddingRight: 10,
    paddingBottom: 10,
  },
  title: {
    marginBottom: 10,
  },
});
