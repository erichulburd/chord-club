import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { ChartQuery, Tag, BaseScopes } from '../types';
import TagAutocomplete from './TagAutocomplete';
import { TagCollection } from './TagCollection';
import { useState } from 'react';
import { areTagsEqual } from '../util/forms';
import { StringCheckboxGroup } from './shared/CheckboxGroup';
import { UserConsumerProps, withUser } from './UserContext';
import identity from 'lodash/identity';
import { Row } from './shared/Row';
import { Button, Card, Text } from '@ui-kitten/components';

interface ManualProps {
  save: (q: ChartQuery) => void;
  cancel: () => void;
  initialQuery: ChartQuery;
}

interface Props extends ManualProps, UserConsumerProps {}

const ChartQueryEditor = ({ initialQuery, userCtx, save, cancel }: Props) => {
  const { authState } = userCtx;
  const [tags, setTags] = useState<Tag[]>([]);
  const [query, setQuery] = useState<ChartQuery>(initialQuery);
  const addTag = (tag: Tag) => {
    if (tags.some(t => areTagsEqual(t, tag))) {
      return;
    }
    const tagUpdate = [...tags, tag];
    setTags(tagUpdate);
    setQuery({
      ...query,
      tagIDs: tagUpdate.map(t => t.id),
    });
  };
  const removeTag = (tag: Tag) => {
    const index = tags.findIndex(t => t.id === tag.id);
    if (index === -1) {
      return;
    }
    const tagUpdate = [...tags];
    tagUpdate.splice(index, 1);
    setTags(tagUpdate);
    setQuery({
      ...query,
      tagIDs: tagUpdate.map(t => t.id),
    });
  };
  const selectedScopes: string[] = [];
  if (query.scopes?.includes(BaseScopes.Public)) selectedScopes.push('Public');
  if (query.scopes?.includes(authState.uid)) selectedScopes.push('Private');
  const toggleScopes = (s: string, checked: boolean) => {
    const scope = s === 'Private' ? authState.uid : BaseScopes.Public;
    let index = query.scopes?.indexOf(scope);
    if (index === undefined) index = -1;
    if (checked && index < 0) {
      setQuery({
        ...query,
        scopes: [...query.scopes || [], scope],
      });
    } else if (!checked && index >= 0) {
      const scopes = [...query.scopes || []];
      scopes.splice(index, 1);
      setQuery({ ...query, scopes });
    }
  }
  const Header = (props: ViewProps | undefined) => (
    <View {...props}><Text category="h6">Query</Text></View>
  )
  const resetAndCancel = () => {
    setQuery(initialQuery);
    cancel();
  }
  const Footer = (props: ViewProps | undefined) => (
    <View {...props} style={[(props?.style || {}), styles.footer]}>
      <Button
        size="small"
        status="primary"
        appearance="outline"
        onPress={() => save(query)}
      >Save</Button>
      <Button
        size="small"
        status="warning"
        appearance="outline"
        onPress={resetAndCancel}
      >Cancel</Button>
    </View>
  )
  return (
    <Card
      style={styles.container}
      header={Header}
      footer={Footer}
      status="basic"
    >
      <Row>
        <StringCheckboxGroup
          multi
          display={ct => identity(ct)}
          choices={['Public', 'Private']}
          selected={selectedScopes}
          onToggle={toggleScopes}
        />
      </Row>
      <View>
        <TagAutocomplete
          placeholder={'Select tags'}
          includePublic={query.scopes?.includes(BaseScopes.Public) || false}
          allowNewTags={false}
          onSelect={addTag}
        />
        <TagCollection
          tags={tags}
          onDelete={removeTag}
        />
      </View>
    </Card>
  )
}

const styles = StyleSheet.create({
  container: {
    margin: 10,
    alignSelf: 'stretch',
    flex: 2,
  },
  footer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around'
  }
})

export default withUser<ManualProps>(ChartQueryEditor);
