import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/react-hooks';
import { ChartQuery, Chart } from '../types';
import last from 'lodash/last';
import { CHARTS_QUERY, ChartsQueryResponse, ChartsQueryVariables, DELETE_CHART_MUTATION, DeleteChartMutationVariables } from '../gql/chart';
import { ScrollView, FlatList } from 'react-native-gesture-handler';
import { Spinner, ViewPager } from '@ui-kitten/components';
import ChartItem from './ChartItem';
import { RefreshControl, View, StyleSheet } from 'react-native';
import { withModalContext, ModalContextProps } from './ModalProvider';

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
  const [hidden, setHidden] = useState<Set<number>>(new Set());
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
  const charts = (data?.charts || []).filter((chart) =>
    !deleted.has(chart.id) && !hidden.has(chart.id));
  if (loading) {
    return (<View><Spinner /></View>);
  }
  return (
    <FlatList
      horizontal
      data={charts}
      keyExtractor={chart => chart.id.toString()}
      renderItem={(item) => (
        <ChartItem
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
