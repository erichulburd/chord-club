import React from 'react';
import {AppScreen, Screens, AppRouteProp} from './AppScreen';
import { useRoute, useNavigation } from '@react-navigation/native';
import ChartEditor from './ChartEditor';

export const ChartEditorScreen = () => {
  const route = useRoute<AppRouteProp<'EditChart'>>();
  const { chart } = route.params;
  const navigation = useNavigation();
  const close = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    navigation.navigate(Screens.Chords);
  };
  return (
    <AppScreen title={Screens.EditChart} menuItems={[]}>
      <ChartEditor
        chart={chart}
        close={close}
      />
    </AppScreen>
  );
};


