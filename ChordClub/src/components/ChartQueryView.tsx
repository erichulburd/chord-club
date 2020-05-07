import React, {useState} from 'react';
import {ChartQueryModal} from './ChartQueryModal';
import {View, StyleSheet} from 'react-native';
import {ChartQuery, ChartViewSetting} from '../types';
import {AppScreen, Screens} from './AppScreen';
import ErrorText from './ErrorText';
import {Spinner} from '@ui-kitten/components';
import {withUser, SettingsPath, UserConsumerProps} from './UserContext';
import {MenuItemData} from './Title';

interface ManualProps {
  title: Screens;
  settingsPath: SettingsPath;
  expandable?: boolean;
  reversable?: boolean;
  renderQueryResults: (setting: ChartViewSetting) => React.ReactElement;
}

interface Props extends ManualProps, UserConsumerProps {}

const ChartQueryView = ({
  title,
  renderQueryResults,
  userCtx,
  settingsPath,
  reversable = true,
  expandable = true,
}: Props) => {
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
    ]
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
  const {userError, userLoading} = userCtx;

  return (
    <AppScreen title={title} menuItems={menuItems}>
      <View>
        {userError && <ErrorText error={userError} />}
        {userLoading && <Spinner />}
        {!userLoading && !userError && settings && renderQueryResults(settings)}
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

const styles = StyleSheet.create({
  queryControls: {
    justifyContent: 'space-around',
  },
});

export default withUser<ManualProps>(ChartQueryView);
