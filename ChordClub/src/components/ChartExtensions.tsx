import React from 'react';
import {useQuery} from '@apollo/react-hooks';
import {
  CHART_EXTENSIONS_QUERY,
  ChartExtensionsQueryResponse,
  ChartExtensionsQueryVariables,
} from '../gql/chart';
import {View} from 'react-native';
import {Spinner, Text} from '@ui-kitten/components';
import ErrorText from './ErrorText';
import {displayExtension} from '../util/strings';
import {ChartType} from '../types';

interface Props {
  chartID: number;
}
export const ChartExtensions = ({chartID}: Props) => {
  const {loading, data, error, refetch} = useQuery<
    ChartExtensionsQueryResponse,
    ChartExtensionsQueryVariables
  >(CHART_EXTENSIONS_QUERY, {
    variables: {chartID, chartTypes: [ChartType.Chord, ChartType.Progression]},
  });
  const maybeDoRefetch = () => {
    refetch && refetch().catch(err => console.warn(err));
  };
  return (
    <View>
      {loading && <Spinner />}
      {error && (
        <ErrorText
          error={'We could not load extensions for this chart.'}
          retry={maybeDoRefetch}
        />
      )}
      {data && (
        <Text>
          {data.charts[0].extensions?.map((e) => displayExtension(e)).join(' ')}
        </Text>
      )}
    </View>
  );
};
