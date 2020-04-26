import React from 'react';
import { useQuery } from '@apollo/react-hooks';
import { ChartQuery } from '../types';
import last from 'lodash/last';
import { CHARTS_QUERY, ChartsQueryResponse, ChartsQueryVariables } from '../gql/chart';
import { ScrollView, FlatList } from 'react-native-gesture-handler';
import { Spinner } from '@ui-kitten/components';
import { ChartItem } from './ChartItem';

interface Props {
  query: ChartQuery;
}

export const ChartList = ({ query }: Props) => {
  const { data, loading, error, fetchMore } =
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

  return (
    <ScrollView>
      <FlatList
        data={data?.charts}
        keyExtractor={chart => chart.id.toString()}
        renderItem={(item) => <ChartItem chart={item.item} />}
      />
      {loading && <Spinner />}
    </ScrollView>
  )
};

