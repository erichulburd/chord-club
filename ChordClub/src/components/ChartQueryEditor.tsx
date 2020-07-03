import React, { useContext } from 'react';
import {View, StyleSheet, ViewProps} from 'react-native';
import {ChartQuery, Tag, ChartQueryOrder} from '../types';
import {useState} from 'react';
import {Row} from './shared/Row';
import {Button, Card, Text, CheckBox} from '@ui-kitten/components';
import {TagIDCollectionEditor} from './TagCollectionEditor';
import { AuthContext } from './UserContext';
import auth from '../util/auth';

interface ManualProps {
  save: (q: ChartQuery) => void;
  cancel: () => void;
  initialQuery: ChartQuery;
}

interface Props extends ManualProps {}

const ChartQueryEditor = ({initialQuery, save, cancel}: Props) => {
  const {authState} = useContext(AuthContext);
  const uid = authState.uid || auth.currentState().uid;
  const [query, setQuery] = useState<ChartQuery>(initialQuery);
  const setTags = (tags: Tag[]) =>
    setQuery({...query, tagIDs: tags.map((t) => t.id)});

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

export default ChartQueryEditor;
