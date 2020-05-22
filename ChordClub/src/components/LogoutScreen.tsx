import React, { useCallback, useContext } from 'react';
import { AppScreen, Screens } from './AppScreen';
import { Text, Card } from '@ui-kitten/components';
import { CenteredSpinner } from './CenteredSpinner';
import { useFocusEffect } from '@react-navigation/native';
import { AuthContext } from './UserContext';

interface Props {

}

export const LogoutScreen = ({}: Props) => {
  const userCtx = useContext(AuthContext);
  useFocusEffect(
    useCallback(() => {
      userCtx.authActions.logout();
    }, [userCtx]),
  );
  return (
    <AppScreen title={Screens.Logout}>
      <Card
        disabled
      >
        <Text category="h6">Logging out...</Text>
        <CenteredSpinner size={'giant'} status={'warning'} />
      </Card>
    </AppScreen>
  );
};
