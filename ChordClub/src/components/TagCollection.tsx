import React from 'react';
import {TagNew, Tag} from '../types';
import {View, StyleSheet} from 'react-native';
import {TagLabel, TagLabelNavigable} from './Tag';
import {getTagKey} from '../util/forms';
import { ThemedIcon } from './FontAwesomeIcons';

interface Props {
  tags: (Tag | TagNew)[];
  navigable?: boolean;
  onDelete?: ((tag: Tag | TagNew) => void);
}

export const TagCollection = ({tags, onDelete, navigable=false}: Props) => {
  return (
    <View style={styles.container}>
      {tags.map((t) => (
        navigable ?
          (<TagLabelNavigable
            key={getTagKey(t)}
            tag={t}
          />) :
          (<TagLabel
            key={getTagKey(t)}
            tag={t}
            accessory={ThemedIcon('times')}
            onPress={onDelete && (() => onDelete(t))}
          />)
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
  },
});
