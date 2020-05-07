import React from 'react';
import {AppScreen, Screens} from './AppScreen';
import Account from './Account';

export const AccountScreen = () => {
  return (
    <AppScreen title={Screens.Account} menuItems={[]}>
      <Account />
    </AppScreen>
  );
};


