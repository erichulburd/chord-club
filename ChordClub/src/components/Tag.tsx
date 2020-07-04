import React, { useContext, useCallback } from 'react';
import {Tag, TagNew, ChartType} from '../types';
import {View, StyleSheet} from 'react-native';
import {Button} from '@ui-kitten/components';
import {Size} from '../util/themeHelpers';
import { useNavigationState } from '@react-navigation/native';
import { AuthContext } from './UserContext';
import { Screens } from './AppScreen';
import { ChartViewSetting } from '../util/settings';
import { RenderProp } from '@ui-kitten/components/devsupport';

interface NavigableProps {
  tag: Tag | TagNew;
  size?: Size;
}

export const TagLabelNavigable = ({tag, size}: NavigableProps) => {
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
      onPress={goToTag}
      size={size}
    />
  )
}

interface Props extends NavigableProps {
  onPress?: () => void;
  accessory?: RenderProp;
}

export const TagLabel = ({tag, onPress, accessory, size = 'tiny'}: Props) => {
  return (
    <View style={styles.container}>
      <Button
        size={size}
        appearance="outline"
        status={'info'}
        onPress={onPress}
        accessoryRight={accessory}
      >
        {tag.displayName}
      </Button>
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
