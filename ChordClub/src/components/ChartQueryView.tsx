import React, { useState } from 'react';
import { ChartQueryModal } from './ChartQueryModal';
import { View, StyleSheet } from 'react-native';
import { Button } from '@ui-kitten/components';
import { ThemedIcon } from './FontAwesomeIcons';
import { ChartQuery } from '../types';
import { Row } from './shared/Row';

interface ChartQueryConsumerProps {
  query: ChartQuery;
}

interface Props {
  initialQuery: ChartQuery;
  renderQueryResults: (props: ChartQueryConsumerProps) => React.ReactElement;
}

export const ChartQueryView = ({ initialQuery, renderQueryResults }: Props) => {
  const [query, setQuery] = useState<ChartQuery>(initialQuery)
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false)
  const save = (q: ChartQuery) => {
    setQuery(q);
    setIsEditorOpen(false);
  };

  return (
    <View style={styles.container}>
      <Row style={styles.queryControls}>
        <Button
          appearance="outline"
          size="small"
          status="basic"
          accessoryLeft={ThemedIcon('filter')}
          onPress={() => setIsEditorOpen(!isEditorOpen)}
        ></Button>
        <Button
          appearance="outline"
          size="small"
          status="basic"
          accessoryLeft={ThemedIcon(query.asc ? 'sort-amount-up' : 'sort-amount-down')}
          onPress={() => setQuery({ ...query, asc: !query.asc })}
        ></Button>
      </Row>
      {renderQueryResults({ query })}
      <ChartQueryModal
        query={query}
        save={save}
        close={() => setIsEditorOpen(false)}
        isOpen={isEditorOpen}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {

  },
  queryControls: {
    justifyContent: 'space-around'
  }
})
