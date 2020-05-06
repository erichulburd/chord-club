import React from 'react';
import {TagNew, Tag} from '../types';
import {View, StyleSheet} from 'react-native';
import {TagLabel} from './Tag';
import {getTagKey} from '../util/forms';

interface Props {
  tags: (Tag | TagNew)[];
  onDelete?: ((tag: Tag | TagNew) => void) | ((tag: Tag) => void);
}

export const TagCollection = ({tags, onDelete}: Props) => {
  return (
    <View style={styles.container}>
      {tags.map((t) => (
        <TagLabel
          key={getTagKey(t)}
          tag={t}
          onDelete={onDelete && (() => onDelete(t))}
        />
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
