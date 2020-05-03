import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { ChartQuery, Tag, ChartType, BaseScopes } from '../types';
import TagAutocomplete from './TagAutocomplete';
import { TagCollection } from './TagCollection';
import { useState } from 'react';
import { areTagsEqual } from '../util/forms';
import { ChartTypeCheckboxGroup, StringCheckboxGroup } from './shared/CheckboxGroup';
import { AuthConsumerProps, withAuth } from './AuthProvider';
import capitalize from 'lodash/capitalize';
import identity from 'lodash/identity';
import { Row } from './shared/Row';
import { Button, Card, Text } from '@ui-kitten/components';
import { ThemedIcon } from './FontAwesomeIcons';

interface ManualProps {
  onChange: (q: ChartQuery) => void;
  query: ChartQuery;
}

interface Props extends ManualProps, AuthConsumerProps {}

const ChartQueryComponent = ({ onChange, query, authState }: Props) => {
  const [tags, setTags] = useState<Tag[]>([]);
  const addTag = (tag: Tag) => {
    if (tags.some(t => areTagsEqual(t, tag))) {
      return;
    }
    const tagUpdate = [...tags, tag];
    setTags(tagUpdate);
    onChange({
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
    onChange({
      ...query,
      tagIDs: tagUpdate.map(t => t.id),
    });
  };
  const toggleChartType = (ct: ChartType, checked: boolean) => {
    const index = query.chartTypes.indexOf(ct);
    if (!checked && index >= 0) {
      if (query.chartTypes.length > 1) {
        const chartTypes = [...query.chartTypes];
        chartTypes.splice(index, 1);
        onChange({ ...query, chartTypes, });
      }
    } else if (checked && index < 0) {
      onChange({
        ...query,
        chartTypes: [...query.chartTypes, ct],
      });
    }
  }
  const selectedScopes: string[] = [];
  if (query.scopes?.includes(BaseScopes.Public)) selectedScopes.push('Public');
  if (query.scopes?.includes(authState.uid)) selectedScopes.push('Private');
  const toggleScopes = (s: string, checked: boolean) => {
    const scope = s === 'Private' ? authState.uid : BaseScopes.Public;
    let index = query.scopes?.indexOf(scope);
    if (index === undefined) index = -1;
    if (checked && index < 0) {
      onChange({
        ...query,
        scopes: [...query.scopes || [], scope],
      });
    } else if (!checked && index >= 0) {
      const scopes = [...query.scopes || []];
      scopes.splice(index, 1);
      onChange({ ...query, scopes });
    }
  }
  const reverseDirection = () => {
    onChange({ ...query, asc: !query.asc });
  }
  const Header = (props: ViewProps | undefined) => (
    <View {...props}><Text category="h6">Query</Text></View>
  )
  return (
    <Card
      style={styles.container}
      header={Header}
      status="basic"
    >
      <Row>
        <ChartTypeCheckboxGroup
          multi
          choices={[ChartType.Chord, ChartType.Progression]}
          display={ct => capitalize(ct)}
          selected={query.chartTypes}
          onToggle={toggleChartType}
        />
        <Button
          appearance={'ghost'}
          accessoryLeft={ThemedIcon(query.asc ? 'sort-amount-up' : 'sort-amount-down')}
          onPress={reverseDirection}
        />
      </Row>
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

  }
})

export default withAuth<ManualProps>(ChartQueryComponent);
