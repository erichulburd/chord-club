import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/react-hooks';
import { ChartQuery, Chart, ChartType } from '../types';
import last from 'lodash/last';
import { CHARTS_QUERY, ChartsQueryResponse, ChartsQueryVariables, DELETE_CHART_MUTATION, DeleteChartMutationVariables } from '../gql/chart';
import { FlatList } from 'react-native-gesture-handler';
import { Spinner } from '@ui-kitten/components';
import ChartItem from './ChartItem';
import { View, StyleSheet } from 'react-native';
import { withModalContext, ModalContextProps } from './ModalProvider';
import { ChordClubShim } from '../../types/ChordClubShim';

interface ManualProps {
  query: ChartQuery;
  editChart: (chart: Chart) => void;
}

interface Props extends ModalContextProps, ManualProps {}

const ChartList = ({ query, editChart, modalCtx }: Props) => {
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
    <FlatList
      horizontal
      ref={ref => { flatList = ref as ChordClubShim.FlatList<Chart> }}
      onScrollToIndexFailed={() => undefined}
      data={charts}
      keyExtractor={chart => chart.id.toString()}
      renderItem={(item) => (
        <ChartItem
          next={() => next(item.index)}
          chart={item.item}
          editChart={editChart}
          onDeleteChart={onDeleteChart}
        />
      )}
    />
  );
};

const styles = StyleSheet.create({
  container: {},
  list: {}
})


export default withModalContext<ManualProps>(ChartList);
