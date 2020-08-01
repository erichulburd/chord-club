import React from 'react';
import {View, StyleSheet} from 'react-native';
import {ChartQuery, ChartType, ChartQueryOrder} from '../types';
import {AppScreen, Screens} from './AppScreen';
import ErrorText from './ErrorText';
import {Spinner, Button} from '@ui-kitten/components';
import {withUser, UserConsumerProps} from './UserContext';
import {MenuItemData} from './Title';
import {
  ChartViewSetting,
  SettingsPath,
} from '../util/settings';
import { ThemedIcon } from './FontAwesomeIcons';
import { useNavigation } from '@react-navigation/native';

interface ManualProps<T> {
  title: Screens;
  settingsPath: SettingsPath;
  expandable?: boolean;
  reversable?: boolean;
  renderQueryResults: (setting: T) => React.ReactElement;
}

interface Props<T> extends ManualProps<T>, UserConsumerProps {}

type ChartViewProps = Props<ChartViewSetting>;

const styles = StyleSheet.create({
  addButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
  }
})

const AddProgressionButton = () => {
  const navigation = useNavigation();
  return (
    <Button
      status="success"
      style={styles.addButton}
      accessoryRight={ThemedIcon('plus')}
      onPress={() =>
        navigation.navigate(Screens.RecordAProgression, {
          chartType: ChartType.Progression,
        })
      }
    />
  );
};

const ChartQueryView = ({
  title,
  renderQueryResults,
  userCtx,
  settingsPath,
  expandable = true,
  reversable = true,
}: ChartViewProps) => {
  const settings: ChartViewSetting = userCtx.user?.settings[settingsPath];

  const save = (q: ChartQuery) => {
    userCtx.updateChartQuery(settingsPath, q);
  };
  let menuItems: MenuItemData[] = [];
  if (settings) {
    const {query, compact} = settings;

    if (query.order === ChartQueryOrder.Random) {
      menuItems.push({
        title: 'Sort',
        themedIconName: 'sort-amount-down',
        onPress: () =>
          userCtx.updateChartQuery(settingsPath, {...query, asc: false, order: undefined}),
      });
    } else if (reversable) {
      menuItems.push({
        title: 'Randomize',
        themedIconName: 'random',
        onPress: () => {
          userCtx.updateChartQuery(settingsPath, {...query, order: ChartQueryOrder.Random});
        }
      });
      menuItems.push({
        title: 'Reverse',
        themedIconName: query.asc ? 'sort-amount-down' : 'sort-amount-up',
        onPress: () =>
          userCtx.updateChartQuery(settingsPath, {...query, asc: !query.asc}),
      });
    }
    if (expandable) {
      menuItems.push({
        title: compact ? 'Expand all' : 'Compact all',
        themedIconName: compact ? 'expand' : 'compress',
        onPress: () => userCtx.updateCompact(settingsPath, !compact),
      });
    }
  }
  const {userError, userLoading, authState} = userCtx;
  const showResults = Boolean(authState.token) && !userLoading && !userError && Boolean(settings);
  return (
    <AppScreen
      title={title}
      menuItems={menuItems}
      more={
        <AddProgressionButton />
      }
    >
      {userError && <View><ErrorText error={userError} /></View>}
      {userLoading && <View><Spinner /></View>}
      {showResults && renderQueryResults(settings)}
    </AppScreen>
  );
};

export default withUser<ManualProps<ChartViewSetting>>(
  ChartQueryView,
);
