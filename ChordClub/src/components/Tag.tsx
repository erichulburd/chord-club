import React, { useContext, useCallback } from 'react';
import {Tag, TagNew, ChartType} from '../types';
import {View, StyleSheet} from 'react-native';
import {Button} from '@ui-kitten/components';
import {ThemedIcon} from './FontAwesomeIcons';
import {Size} from '../util/themeHelpers';
import { useNavigationState } from '@react-navigation/native';
import { AuthContext } from './UserContext';
import { Screens } from './AppScreen';
import { ChartViewSetting } from 'src/util/settings';

interface NavigableProps {
  tag: Tag | TagNew;
  onDelete?: undefined | (() => void);
  size?: Size;
}

export const TagLabelNavigable = ({tag, onDelete, size}: NavigableProps) => {
  const route = useNavigationState(state => state.routes[state.index]);
  const userCtx = useContext(AuthContext);

  const goToTag = useCallback(() => {
    const existingTag = (tag as Tag).id === undefined ? undefined : tag as Tag;
    if (!existingTag) {
      return;
    }
    if (route.name === Screens.Progressions) {
      const settings = userCtx.user?.settings.progressions as ChartViewSetting;
      userCtx.updateChartQuery('progressions', {
        tagIDs: [existingTag.id],
        chartTypes: [ChartType.Progression],
      });
    }
  }, [route.name, userCtx]);
  return (
    <TagLabel
      tag={tag}
      onDelete={onDelete}
      onPress={goToTag}
      size={size}
    />
  )
}

interface Props extends NavigableProps {
  onPress?: () => void;
}

export const TagLabel = ({tag, onDelete, onPress, size = 'tiny'}: Props) => {
  return (
    <View style={styles.container}>
      <Button
        size={size}
        appearance="outline"
        status={'info'}
        accessoryLeft={ThemedIcon('user')}
        onPress={onPress}>{` ${tag.displayName}`}</Button>
      {onDelete && (
        <Button
          size={size}
          appearance="outline"
          status="danger"
          accessoryLeft={ThemedIcon('times')}
          onPress={onDelete}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
});
