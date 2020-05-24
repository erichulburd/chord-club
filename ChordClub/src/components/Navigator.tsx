import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {
  createDrawerNavigator,
  DrawerContentComponentProps,
  DrawerContentOptions,
  DrawerNavigationProp,
} from '@react-navigation/drawer';
import ChordListScreen from './ChordListScreen';
import ProgressionListScreen from './ProgressionListScreen';
import {
  Drawer,
  DrawerItem,
  IndexPath,
  Divider,
  Text,
  withStyles,
  ThemedComponentProps,
} from '@ui-kitten/components';
import {SafeAreaView, View, ViewProps, StyleSheet} from 'react-native';
import {ChartCreatorScreen} from './ChartCreatorScreen';
import {Screens, ScreenProps} from './AppScreen';
import {ThemedIcon} from './FontAwesomeIcons';
import {FlashcardsScreen} from './FlashcardsScreen';
import {AccountScreen} from './AccountScreen';
import {ChartEditorScreen} from './ChartEditorScreen';
import {TagListScreen} from './TagListScreen';
import { BlankScreen } from './BlankScreen';
import { LogoutScreen } from './LogoutScreen';
import LoginScreen from './LoginScreen';

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

interface DrawerNavigationProps {
  navigation: DrawerNavigationProp<{}>;
}

type DrawerContentProps = DrawerContentComponentProps<DrawerContentOptions> &
  DrawerNavigationProps;

const DrawerContent = ({
  navigation,
  state,
}: DrawerContentProps) => {

  const goToRoute = async (index: IndexPath) => {
    const route = state.routeNames[index.row];
    navigation.navigate(route);
  };

  return (
    <Drawer
      header={Header}
      selectedIndex={new IndexPath(state.index)}
      onSelect={goToRoute}>
      <SafeAreaView>
        <DrawerItem accessoryLeft={ThemedIcon('list')} title={Screens.Chords} />
        <DrawerItem
          accessoryLeft={ThemedIcon('list')}
          title={Screens.Progressions}
          key={Screens.Progressions}
        />
        <DrawerItem
          accessoryLeft={ThemedIcon('bolt')}
          title={Screens.ChordFlashcards}
          key={Screens.ChordFlashcards}
        />
        <DrawerItem
          accessoryLeft={ThemedIcon('circle', {solid: true})}
          title={Screens.CreateAChart}
          key={Screens.CreateAChart}
        />
        <DrawerItem accessoryLeft={ThemedIcon('tags')} title={Screens.Tags} />
        <DrawerItem
          accessoryLeft={ThemedIcon('user-cog')}
          title={Screens.Account}
          key={Screens.Account}
        />
        <DrawerItem
          accessoryLeft={ThemedIcon('sign-out-alt')}
          title={Screens.Logout}
          key={Screens.Logout}
        />
      </SafeAreaView>
    </Drawer>
  );
};

interface Props {}

const routes: [Screens, React.FunctionComponent<ScreenProps> | React.ComponentClass][] = [
  [Screens.Chords, ChordListScreen],
  [Screens.Progressions, ProgressionListScreen],
  [Screens.ChordFlashcards, FlashcardsScreen],
  [Screens.CreateAChart, ChartCreatorScreen],
  [Screens.Tags, TagListScreen],
  [Screens.Account, AccountScreen],
  [Screens.Logout, LogoutScreen],
  [Screens.Login, LoginScreen],
  [Screens.EditChart, ChartEditorScreen],
  [Screens.Blank, BlankScreen],
]

export const AppNavigator = ({}: Props) => (
  <NavigationContainer>
    <Navigator
      drawerContent={(props) => (
        <DrawerContent {...props} />
      )}
      initialRouteName={Screens.Chords}
    >
      {routes.map(([screenName, screen]) => (
        <Screen key={screenName} name={screenName} component={screen} />
      ))}
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

export default AppNavigator;
