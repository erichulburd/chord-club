import React, {useState, useCallback} from 'react';
import {AppScreen, Screens, AppRouteProp} from './AppScreen';
import {
  useRoute,
  useNavigation,
  useFocusEffect,
} from '@react-navigation/native';
import ChartEditor from './ChartEditor';
import uuid from 'react-native-uuid';

export const ChartEditorScreen = () => {
  const route = useRoute<AppRouteProp<'EditChart'>>();
  const {chart} = route.params;
  const [mountID, setMountID] = useState(uuid.v4());

  useFocusEffect(
    useCallback(() => {
      setMountID(uuid.v4());
    }, []),
  );

  const navigation = useNavigation();
  const close = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    navigation.navigate(Screens.Progressions);
  };
  return (
    <AppScreen title={Screens.EditChart} menuItems={[]}>
      <ChartEditor mountID={mountID} chart={chart} close={close} />
    </AppScreen>
  );
};
