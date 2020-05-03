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
  const [dismissed, setDismissed] = useState<Record<number, boolean>>({});
  const [deleteChart, {}] = useMutation<{}, DeleteChartMutationVariables>(DELETE_CHART_MUTATION);
  const onDeleteChart = (chartID: number) => {
    modalCtx.message({
      msg: 'Are you sure you want to delete this chart?',
      status: 'warning',
    }, {
      confirm: () => {
        deleteChart({ variables: { chartID } });
        setDismissed({ ...dismissed, [chartID]: true });
      },
      cancel: () => undefined,
    })
  };
  const charts= (data?.charts || []).filter((chart) => !dismissed[chart.id]);
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
