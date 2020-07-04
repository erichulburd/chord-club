import React, {useState, useEffect} from 'react';
import {useQuery, useMutation} from '@apollo/react-hooks';
import {ChartQuery, Chart, ChartType} from '../types';
import last from 'lodash/last';
import {
  CHARTS_QUERY,
  ChartsQueryResponse,
  ChartsQueryVariables,
  DELETE_CHART_MUTATION,
  DeleteChartMutationVariables,
} from '../gql/chart';
import {FlatList} from 'react-native-gesture-handler';
import {Spinner, Text, Button} from '@ui-kitten/components';
import ChordItem from './ChordItem';
import {View, RefreshControl, StyleSheet} from 'react-native';
import {withModalContext, ModalContextProps} from './ModalProvider';
import {ChordClubShim} from '../../types/ChordClubShim';
import {useNavigation} from '@react-navigation/native';
import {Screens} from './AppScreen';

const CreateChordLink = () => {
  const navigation = useNavigation();
  return (
    <Button
      appearance="outline"
      status="info"
      onPress={() =>
        navigation.navigate(Screens.RecordAProgression, {
          chartType: ChartType.Chord,
        })
      }>
      Create new chord!
    </Button>
  );
};

const ListEmptyComponent = () => (
  <View style={styles.emptyList}>
    <Text category="h6" status="warning">
      No chords found.
    </Text>
  </View>
);

interface ManualProps {
  query: ChartQuery;
  compact: boolean;
  mountID: string;
  editChart: (chart: Chart) => void;
}

interface Props extends ModalContextProps, ManualProps {}

const ChordList = ({query, compact, mountID, editChart, modalCtx}: Props) => {
  const {data, loading, refetch, fetchMore} = useQuery<
    ChartsQueryResponse,
    ChartsQueryVariables
  >(CHARTS_QUERY, {
    variables: {
      query,
    },
  });
  const maybeDoRefetch = () => {
    refetch && refetch().catch(err => console.warn(err));
  };
  useEffect(() => {
    maybeDoRefetch();
  }, [mountID]);

  const [deleted, setDeleted] = useState<Set<number>>(new Set());
  const charts = (data?.charts || []).filter(
    (chart: Chart) => !deleted.has(chart.id),
  );
  /*
  const lastChart: Chart | undefined = last(charts);
  const loadMore = () =>
    fetchMore({
      variables: {
        query: {...query, after: lastChart?.id},
      },
      updateQuery: (prev: ChartsQueryResponse, {fetchMoreResult}) => {
        if (!fetchMoreResult) {
          return prev;
        }
        return {
          charts: [...prev.charts, ...(fetchMoreResult?.charts || [])],
        };
      },
    });
  */
  const [deleteChart, {}] = useMutation<{}, DeleteChartMutationVariables>(
    DELETE_CHART_MUTATION,
  );
  const onDeleteChart = (chartID: number) => {
    modalCtx.message(
      {
        msg: 'Are you sure you want to delete this chart?',
        status: 'warning',
      },
      {
        confirm: () => {
          deleteChart({variables: {chartID}});
          setDeleted(new Set([chartID, ...Array.from(deleted)]));
        },
        cancel: () => undefined,
      },
    );
  };
  if (loading) {
    return (
      <View>
        <Spinner />
      </View>
    );
  }
  let flatList: ChordClubShim.FlatList<Chart> | null = null;
  const next = (i: number) => {
    if (flatList === null || i === charts.length - 1) {
      return;
    }
    flatList.scrollToIndex({index: i + 1});
  };
  return (
    <View style={styles.container}>
      <FlatList
        onRefresh={maybeDoRefetch}
        refreshing={loading}
        ListFooterComponent={<CreateChordLink />}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={maybeDoRefetch} />
        }
        ref={(ref) => {
          flatList = ref as ChordClubShim.FlatList<Chart>;
        }}
        onScrollToIndexFailed={() => undefined}
        data={charts}
        keyExtractor={(chart: Chart) => chart.id.toString()}
        ListEmptyComponent={ListEmptyComponent}
        contentContainerStyle={{
        }}
        renderItem={(item) => (
          <ChordItem
            compact={compact}
            next={() => next(item.index)}
            chart={item.item}
            editChart={editChart}
            onDeleteChart={onDeleteChart}
          />
        )}
      />
    </View>
  );
};

export default withModalContext<ManualProps>(ChordList);

const styles = StyleSheet.create({
  container: {
    marginBottom: 0,
    // flex: 1,
  },
  emptyList: {
    padding: 20,
  },
});
