import React from 'react';
import { Tag, TagNew, BaseScopes } from '../types';
import { View, StyleSheet } from 'react-native';
import { Button } from '@ui-kitten/components';
import { ThemedIcon } from './FontAwesomeIcons';
import { Size } from '../util/themeHelpers';

interface Props {
  tag: Tag | TagNew;
  onDelete?: undefined | (() => void);
  onPress?: () => void;
  size?: Size;
}

export const TagLabel = ({ tag, onDelete, onPress, size = 'tiny' }: Props ) => {

  return (
    <View style={styles.container}>
      <Button
        size={size}
        appearance="outline"
        status={tag.scope === BaseScopes.Public ? 'primary' : 'info'}
        accessoryLeft={ThemedIcon(tag.scope === BaseScopes.Public ? 'users' : 'user')}
        onPress={onPress}
      >{` ${tag.displayName}`}</Button>
      {onDelete &&
        <Button
          size={size}
          appearance="outline"
          status="danger"
          accessoryLeft={ThemedIcon('times')}
          onPress={onDelete}
        />
      }
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  }
})
