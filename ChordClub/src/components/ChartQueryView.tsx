import React, { useState } from 'react';
import { ChartQueryModal } from './ChartQueryModal';
import { View, StyleSheet } from 'react-native';
import { ChartQuery } from '../types';
import { AppScreen, Screens } from './AppScreen';

interface ChartQueryConsumerProps {
  query: ChartQuery;
}

interface Props {
  title: Screens;
  initialQuery: ChartQuery;
  renderQueryResults: (props: ChartQueryConsumerProps) => React.ReactElement;
}

export const ChartQueryView = ({ title, initialQuery, renderQueryResults }: Props) => {
  const [query, setQuery] = useState<ChartQuery>(initialQuery)
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false)
  const save = (q: ChartQuery) => {
    setQuery(q);
    setIsEditorOpen(false);
  };
  const menuItems = [
    {
      title: 'Filter',
      themedIconName: 'filter',
      onPress: () => setIsEditorOpen(!isEditorOpen),
    },
    {
      title: 'Reverse',
      themedIconName: query.asc ? 'sort-amount-up' : 'sort-amount-down',
      onPress: () => setQuery({ ...query, asc: !query.asc }),
    },
  ]

  return (
    <AppScreen title={title} menuItems={menuItems}>
      <View>
        {renderQueryResults({ query })}
        <ChartQueryModal
          query={query}
          save={save}
          close={() => setIsEditorOpen(false)}
          isOpen={isEditorOpen}
        />
      </View>
    </AppScreen>

  );
};

const styles = StyleSheet.create({
  queryControls: {
    justifyContent: 'space-around'
  }
})
