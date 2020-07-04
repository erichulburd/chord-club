import React, {useState} from 'react';
import {ChartQueryModal} from './ChartQueryModal';
import {View, StyleSheet} from 'react-native';
import {ChartQuery, ChartType} from '../types';
import {AppScreen, Screens} from './AppScreen';
import ErrorText from './ErrorText';
import {Spinner, Button} from '@ui-kitten/components';
import {withUser, UserConsumerProps} from './UserContext';
import {MenuItemData} from './Title';
import {
  ChartViewSetting,
  SettingsPath,
  FlashcardViewSetting,
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

type ChartViewProps = Props<ChartViewSetting> | Props<FlashcardViewSetting>;

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
      appearance="outline"
      status="info"
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
  reversable = true,
  expandable = true,
}: ChartViewProps) => {
  const settings = userCtx.user?.settings[settingsPath];

  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);
  const save = (q: ChartQuery) => {
    userCtx.updateChartQuery(settingsPath, q);
    setIsEditorOpen(false);
  };
  let menuItems: MenuItemData[] = [];
  if (settings) {
    const {query, compact} = settings;
    menuItems = [
      {
        title: 'Filter',
        themedIconName: 'filter',
        onPress: () => setIsEditorOpen(!isEditorOpen),
      },
    ];
    if (reversable) {
      menuItems.push({
        title: 'Reverse',
        themedIconName: query.asc ? 'sort-amount-up' : 'sort-amount-down',
        onPress: () =>
          userCtx.updateChartQuery(settingsPath, {...query, asc: !query.asc}),
      });
    }
    if (expandable) {
      menuItems.push({
        title: compact ? 'Expand' : 'Compact',
        themedIconName: compact ? 'expand' : 'compress',
        onPress: () => userCtx.updateCompact(settingsPath, !compact),
      });
    }
  }
  const {userError, userLoading, authState} = userCtx;
  const showResults = Boolean(authState.token) && !userLoading && !userError && settings;
  return (
    <AppScreen
      title={title}
      menuItems={menuItems}
      more={
        <AddProgressionButton />
      }
    >
      <View>
        {userError && <ErrorText error={userError} />}
        {userLoading && <Spinner />}
        {showResults && renderQueryResults(settings)}
        {settings && (
          <ChartQueryModal
            query={settings.query}
            save={save}
            close={() => setIsEditorOpen(false)}
            isOpen={isEditorOpen}
          />
        )}
      </View>
    </AppScreen>
  );
};

export default withUser<ManualProps<ChartViewSetting | FlashcardViewSetting>>(
  ChartQueryView,
);
