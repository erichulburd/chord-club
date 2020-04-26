import React from 'react';
import { StyleSheet, View, ImageProps } from 'react-native';
import {
  Icon, MenuItem, OverflowMenu, Text, TopNavigation, TopNavigationAction, TextProps
} from '@ui-kitten/components';
import { withAuth, AuthConsumerProps } from './AuthProvider';
import { TouchableOpacity } from 'react-native-gesture-handler';


const MenuIcon = (props: Partial<ImageProps> = {}) => (
  <Icon {...props} name='ellipsis-v'/>
);

const InfoIcon = (props: Partial<ImageProps> = {}) => (
  <Icon {...props} name='info'/>
);

const LogoutIcon = (props: Partial<ImageProps> = {}) => (
  <Icon {...props} name='sign-out-alt'/>
);

interface ManualProps {
  title?: string;
  renderMenu?: boolean;
}

interface Props extends AuthConsumerProps, ManualProps {}

export const Title = ({
  authState,
  authActions: { logout },
  title = 'Chord Club',
  renderMenu,
}: Props) => {

  const [menuVisible, setMenuVisible] = React.useState(false);

  const renderTitle = (props: TextProps | undefined) => (
    <View style={styles.titleContainer}>
      <Text category="h5">{title}</Text>
    </View>
  );

  if (!renderMenu) {
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

  const renderOverflowMenuAction = () => (
    <React.Fragment>
      <OverflowMenu
        anchor={renderMenuAction}
        visible={menuVisible}
        onBackdropPress={toggleMenu}>
        {authState.token &&
          <TouchableOpacity
            onPress={logout}
          >
            <MenuItem
              accessoryLeft={LogoutIcon}
              title='Logout'
            />
          </TouchableOpacity>
        }
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
