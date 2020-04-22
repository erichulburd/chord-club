/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */
import React from 'react';
import 'react-native-gesture-handler';
import { ApolloProvider } from '@apollo/react-hooks';
import { ApplicationProvider, IconRegistry } from '@ui-kitten/components';
import { AppNavigator } from './components/Navigator';
import * as eva from '@eva-design/eva';
import client from './client';
import logger from './util/logger';
import { FontAwesome5IconsPack } from './components/FontAwesomeIcons';
import AuthModal from './components/AuthModal';
import { AuthProvider } from './components/AuthProvider';

if(__DEV__) {
  import('./util/reactotron').then(() => logger.info('Reactotron Configured'))
}


declare const global: {HermesInternal: null | {}};

const App = ({}) => {
  return (
    <>
      <IconRegistry icons={FontAwesome5IconsPack} />
      <ApolloProvider client={client}>
        <ApplicationProvider {...eva} theme={eva.dark}>
          <AuthProvider>
            <AppNavigator/>
            <AuthModal />
          </AuthProvider>
        </ApplicationProvider>
      </ApolloProvider>
    </>
  );
};

export default App;
