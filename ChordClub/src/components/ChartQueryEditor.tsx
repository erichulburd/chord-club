import React from 'react';
import {View, StyleSheet, ViewProps} from 'react-native';
import {ChartQuery, Tag, BaseScopes, ChartQueryOrder} from '../types';
import {useState} from 'react';
import {StringCheckboxGroup} from './shared/CheckboxGroup';
import {UserConsumerProps, withUser} from './UserContext';
import identity from 'lodash/identity';
import {Row} from './shared/Row';
import {Button, Card, Text, CheckBox} from '@ui-kitten/components';
import {TagIDCollectionEditor} from './TagCollectionEditor';

interface ManualProps {
  save: (q: ChartQuery) => void;
  cancel: () => void;
  initialQuery: ChartQuery;
}

interface Props extends ManualProps, UserConsumerProps {}

const ChartQueryEditor = ({initialQuery, userCtx, save, cancel}: Props) => {
  const {authState} = userCtx;
  const [query, setQuery] = useState<ChartQuery>(initialQuery);
  const setTags = (tags: Tag[]) =>
    setQuery({...query, tagIDs: tags.map((t) => t.id)});
  const selectedScopes: string[] = [];
  if (query.scopes?.includes(BaseScopes.Public)) {
    selectedScopes.push('Public');
  }
  if (query.scopes?.includes(authState.uid)) {
    selectedScopes.push('Private');
  }
  const toggleScopes = (s: string, checked: boolean) => {
    const scope = s === 'Private' ? authState.uid : BaseScopes.Public;
    let index = query.scopes?.indexOf(scope);
    if (index === undefined) {
      index = -1;
    }
    if (checked && index < 0) {
      setQuery({
        ...query,
        scopes: [...(query.scopes || []), scope],
      });
    } else if (!checked && index >= 0) {
      const scopes = [...(query.scopes || [])];
      scopes.splice(index, 1);
      setQuery({...query, scopes});
    }
  };
  const Header = (props: ViewProps | undefined) => (
    <View {...props}>
      <Text category="h6">Query</Text>
    </View>
  );
  const resetAndCancel = () => {
    setQuery(initialQuery);
    cancel();
  };
  const Footer = (props: ViewProps | undefined) => (
    <View {...props} style={[props?.style || {}, styles.footer]}>
      <Button
        size="small"
        status="primary"
        appearance="outline"
        onPress={() => save(query)}>
        Save
      </Button>
      <Button
        size="small"
        status="warning"
        appearance="outline"
        onPress={resetAndCancel}>
        Cancel
      </Button>
    </View>
  );
  const setChartQueryOrderRandom = (random: boolean) => {
    const update = {...query};
    if (random) {
      update.order = ChartQueryOrder.Random;
    } else {
      delete update.order;
    }
    setQuery(update);
  };
  return (
    <Card
      style={styles.container}
      header={Header}
      footer={Footer}
      status="basic">
      <Row>
        <StringCheckboxGroup
          multi
          display={(ct) => identity(ct)}
          choices={['Public', 'Private']}
          selected={selectedScopes}
          onToggle={toggleScopes}
        />
      </Row>
      <Row>
        <CheckBox
          checked={query.order === ChartQueryOrder.Random}
          onChange={setChartQueryOrderRandom}>
          Random Order
        </CheckBox>
      </Row>
      <View>
        <TagIDCollectionEditor
          ids={query.tagIDs || []}
          onChange={setTags}
          scopes={query.scopes || []}
          allowNewTags={false}
        />
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 10,
    alignSelf: 'stretch',
    flex: 2,
  },
  footer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
});

export default withUser<ManualProps>(ChartQueryEditor);
