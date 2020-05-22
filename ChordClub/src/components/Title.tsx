import React, { useContext } from 'react';
import {StyleSheet, View, ImageProps} from 'react-native';
import {
  Icon,
  MenuItem,
  OverflowMenu,
  Text,
  TopNavigation,
  TopNavigationAction,
  TextProps,
  Button,
} from '@ui-kitten/components';
import {withUser, UserConsumerProps, AuthContext} from './UserContext';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {ThemedIcon} from './FontAwesomeIcons';
import {useNavigation} from '@react-navigation/native';
import {DrawerNavigationProp} from '@react-navigation/drawer';
import { Auth } from 'react-native-auth0';

const MenuIcon = (props: Partial<ImageProps> = {}) => (
  <Icon {...props} name="ellipsis-v" />
);

export interface MenuItemData {
  title: string;
  themedIconName: string;
  onPress: () => void;
}

interface ManualProps {
  title?: string;
  menuItems?: MenuItemData[];
}

interface Props extends UserConsumerProps, ManualProps {}

export const Title = ({title = 'Chord Club', menuItems}: Props) => {
  const [menuVisible, setMenuVisible] = React.useState(false);
  const n = useNavigation() as DrawerNavigationProp<{}>;
  const userCtx = useContext(AuthContext);
  const DrawerBars = () => (
    <Button
      status="basic"
      appearance="ghost"
      accessoryLeft={ThemedIcon('bars')}
      onPress={() => Boolean(userCtx.authState.token) && n.openDrawer()}
    />
  );
  const renderTitle = (_props: TextProps | undefined) => (
    <View style={styles.titleContainer}>
      <Text status="success" category="h5">
        {title}
      </Text>
    </View>
  );

  if (!menuItems || menuItems.length < 1) {
    return <TopNavigation accessoryLeft={DrawerBars} title={renderTitle} />;
  }

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  const renderMenuAction = () => (
    <TopNavigationAction icon={MenuIcon} onPress={toggleMenu} />
  );

  const closeMenuAndExec = (fn: () => void) => {
    setMenuVisible(false);
    fn();
  };

  const renderOverflowMenuAction = () => (
    <React.Fragment>
      <OverflowMenu
        anchor={renderMenuAction}
        visible={menuVisible}
        onBackdropPress={toggleMenu}>
        {menuItems.map(({title, themedIconName, onPress}) => (
          <TouchableOpacity
            key={title}
            onPress={() => closeMenuAndExec(onPress)}>
            <MenuItem
              accessoryLeft={ThemedIcon(themedIconName)}
              title={title}
            />
          </TouchableOpacity>
        ))}
      </OverflowMenu>
    </React.Fragment>
  );

  return (
    <TopNavigation
      title={renderTitle}
      accessoryLeft={DrawerBars}
      accessoryRight={renderOverflowMenuAction}
    />
  );
};

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    marginHorizontal: 16,
  },
});

export default withUser<ManualProps>(Title);
