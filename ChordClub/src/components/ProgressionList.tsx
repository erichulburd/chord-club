import React, { useState } from 'react';
import { View, RefreshControl, StyleSheet } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { ChartQuery, Chart } from '../types';
import {
  ChartsQueryResponse, ChartsQueryVariables,
  CHARTS_QUERY, DELETE_CHART_MUTATION,
  DeleteChartMutationVariables,
} from '../gql/chart';
import { useQuery, useMutation } from 'react-apollo';
import last from 'lodash/last';
import { ModalContextProps, withModalContext } from './ModalProvider';
import { Spinner, Text } from '@ui-kitten/components';
import { ChordClubShim } from 'types/ChordClubShim';
import ProgressionItem from './ProgressionItem';

const ListEmptyComponent = () => (
  <View style={styles.emptyList}>
    <Text category="h6" status="warning">No progressions found.</Text>
  </View>
);

interface ManualProps {
  query: ChartQuery;
  editChart: (chart: Chart) => void;
}

interface Props extends ModalContextProps, ManualProps {}

export const ProgressionList = ({ query, modalCtx, editChart }: Props) => {
  const { data, loading, refetch, fetchMore } =
    useQuery<ChartsQueryResponse, ChartsQueryVariables>(CHARTS_QUERY, { variables: { query } });


  const loadMore = () => fetchMore({
    variables: {
      query: { ...query, after: last(data?.charts || [])?.id }
    },
    updateQuery: (prev, { fetchMoreResult }) => {
      if (!fetchMoreResult) return prev;
      return {
        charts: [...prev.charts, ...(fetchMoreResult?.charts || [])]
      }
    }
  });
  const [deleted, setDeleted] = useState<Set<number>>(new Set);
  const [deleteChart, {}] = useMutation<{}, DeleteChartMutationVariables>(DELETE_CHART_MUTATION);
  const onDeleteChart = (chartID: number) => {
    modalCtx.message({
      msg: 'Are you sure you want to delete this chart?',
      status: 'warning',
    }, {
      confirm: () => {
        deleteChart({ variables: { chartID } });
        setDeleted(new Set([ chartID, ...Array.from(deleted)]));
      },
      cancel: () => undefined,
    })
  };
  const charts = (data?.charts || []).filter((chart) => !deleted.has(chart.id));
  if (loading) {
    return (<View><Spinner /></View>);
  }
  let flatList: ChordClubShim.FlatList<Chart> | null = null;
  const next = (i: number) => {
    if (flatList === null || i === charts.length - 1) {
      return;
    }
    (flatList).scrollToIndex({ index: i + 1 });
  }
  return (
    <View style={styles.container}>
      <FlatList
        onRefresh={() => refetch()}
        refreshing={loading}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={() => refetch()} />}
        ref={ref => { flatList = ref as ChordClubShim.FlatList<Chart> }}
        onScrollToIndexFailed={() => undefined}
        data={charts}
        keyExtractor={chart => chart.id.toString()}
        ListEmptyComponent={ListEmptyComponent}
        renderItem={(item) => (
          <ProgressionItem
            next={() => next(item.index)}
            chart={item.item}
            editChart={editChart}
            onDeleteChart={onDeleteChart}
          />
        )}
      />
    </View>

  );
}


const styles = StyleSheet.create({
  container: {
    marginBottom: 150,

  },
  emptyList: {
    padding: 20,
  }
})

export default withModalContext<ManualProps>(ProgressionList);
