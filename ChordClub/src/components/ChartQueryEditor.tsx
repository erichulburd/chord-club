import React, { useContext, useEffect } from 'react';
import {View, StyleSheet} from 'react-native';
import {ChartQuery, Tag} from '../types';
import {useState} from 'react';
import {Card} from '@ui-kitten/components';
import {TagIDCollectionEditor} from './TagCollectionEditor';
import { AuthContext } from './UserContext';
import auth from '../util/auth';

interface ManualProps {
  save: (q: ChartQuery) => void;
  initialQuery: ChartQuery;
}

interface Props extends ManualProps {}

const ChartQueryEditor = ({initialQuery, save}: Props) => {
  const {authState, getUID} = useContext(AuthContext);
  const uid = getUID();
  const [query, setQuery] = useState<ChartQuery>(initialQuery);
  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);
  const setTags = (tags: Tag[]) =>
    save({...query, tagIDs: tags.map((t) => t.id)});

  return (
    <View>
      <TagIDCollectionEditor
        ids={query.tagIDs || []}
        onChange={setTags}
        allowNewTags={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 10,
  },
  footer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
});

export default ChartQueryEditor;
