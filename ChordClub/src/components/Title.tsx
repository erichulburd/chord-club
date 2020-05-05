import React from 'react';
import { StyleSheet, View, ImageProps } from 'react-native';
import {
  Icon, MenuItem, OverflowMenu, Text, TopNavigation, TopNavigationAction, TextProps
} from '@ui-kitten/components';
import { withAuth, AuthConsumerProps } from './AuthProvider';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { ThemedIcon } from './FontAwesomeIcons';


const MenuIcon = (props: Partial<ImageProps> = {}) => (
  <Icon {...props} name='ellipsis-v'/>
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

interface Props extends AuthConsumerProps, ManualProps {}

export const Title = ({
  title = 'Chord Club',
  menuItems,
}: Props) => {

  const [menuVisible, setMenuVisible] = React.useState(false);

  const renderTitle = (props: TextProps | undefined) => (
    <View style={styles.titleContainer}>
      <Text status="success" category="h5">{title}</Text>
    </View>
  );

  if (!menuItems) {
    return (
      <TopNavigation
        title={renderTitle}
      />
    );
  }

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  const renderMenuAction = () => (
    <TopNavigationAction icon={MenuIcon} onPress={toggleMenu}/>
  );

  const closeMenuAndExec = (fn: () => void) => {
    setMenuVisible(false);
    fn();
  }

  const renderOverflowMenuAction = () => (
    <React.Fragment>
      <OverflowMenu
        anchor={renderMenuAction}
        visible={menuVisible}
        onBackdropPress={toggleMenu}
      >
        {menuItems.map(({ title, themedIconName, onPress }) => (
          <TouchableOpacity
            key={title}
            onPress={() => closeMenuAndExec(onPress)}
          >
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

export default withAuth<ManualProps>(Title);
