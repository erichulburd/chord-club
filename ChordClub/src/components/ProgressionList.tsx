import React, {useState, useEffect, useContext} from 'react';
import {View, RefreshControl, StyleSheet} from 'react-native';
import {FlatList, TouchableOpacity} from 'react-native-gesture-handler';
import {ChartQuery, Chart, ChartType} from '../types';
import {
  ChartsQueryResponse,
  ChartsQueryVariables,
  CHARTS_QUERY,
  DELETE_CHART_MUTATION,
  DeleteChartMutationVariables,
} from '../gql/chart';
import {useQuery, useMutation} from 'react-apollo';
import {ModalContextProps, withModalContext} from './ModalProvider';
import {Spinner, Text, Card} from '@ui-kitten/components';
import {ChordClubShim} from 'types/ChordClubShim';
import ProgressionItem from './ProgressionItem';
import { useNavigation } from '@react-navigation/native';
import { Screens } from './AppScreen';
import { AuthContext } from './UserContext';
import ChartQueryEditor from './ChartQueryEditor';
import { AudioPlayer } from './AudioPlayer';
import { Audioable } from '../util/audio';
import { AudioContext } from './AudioContextProvider';


const ListEmptyComponent = () => {
  const navigation = useNavigation();
  return (
    <View style={styles.emptyList}>
      <TouchableOpacity
        onPress={() =>
          navigation.navigate(Screens.RecordAProgression, {
            chartType: ChartType.Progression,
          })
        }
      >
      <Text category="h4" status="primary">
        Click to get started by recording a progression and adding tags.
      </Text>
      </TouchableOpacity>
    </View>
  );
}

interface ManualProps {
  query: ChartQuery;
  mountID: string;
  compact: boolean | undefined;
  editChart: (chart: Chart) => void;
}

interface Props extends ModalContextProps, ManualProps {}

export const ProgressionList = ({
  query,
  mountID,
  modalCtx,
  compact,
  editChart,
}: Props) => {
  const {data, loading, refetch, fetchMore} = useQuery<
    ChartsQueryResponse,
    ChartsQueryVariables
  >(CHARTS_QUERY, {variables: {query}});
  const maybeDoRefetch = () => {
    refetch && refetch().catch(err => console.warn(err));
  };
  useEffect(() => {
    maybeDoRefetch();
  }, [mountID]);
  const authCtx = useContext(AuthContext);
  const [currentAudio, setCurrentAudio] = useState<[Audioable, number]>([{
    audioURL: '',
    audioLength: 0,
  }, 0]);
  const audioCtx = useContext(AudioContext);
  useEffect(() => {
    if (currentAudio[0].audioURL) {
      audioCtx.startPlay(currentAudio[0]);
    }
  }, [currentAudio[0], currentAudio[1]]);
  /*
  const loadMore = () =>
    fetchMore({
      variables: {
        query: {...query, after: last(data?.charts || [])?.id},
      },
      updateQuery: (prev, {fetchMoreResult}) => {
        if (!fetchMoreResult) {
          return prev;
        }
        return {
          charts: [...prev.charts, ...(fetchMoreResult?.charts || [])],
        };
      },
    });
    */
  const [deleted, setDeleted] = useState<Set<number>>(new Set());
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
  const charts = (data?.charts || []).filter((chart) => !deleted.has(chart.id));
  if (loading) {
    return (
      <View>
        <Spinner />
      </View>
    );
  }
  let flatList: ChordClubShim.FlatList<Chart> | null = null;
  return (
    <View>
      <Card
        disabled
        status="basic"
        style={styles.controls}
      >
        <AudioPlayer
          displayAudioNameAndCreator
          audio={currentAudio[0]}
        />
        <ChartQueryEditor
          initialQuery={query}
          save={(q) => authCtx.updateChartQuery('progressions', {...query, ...q})}
        />
      </Card>

      <FlatList
        onRefresh={maybeDoRefetch}
        refreshing={loading}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={maybeDoRefetch} />
        }
        ref={(ref) => {
          flatList = ref as ChordClubShim.FlatList<Chart>;
        }}
        onScrollToIndexFailed={() => undefined}
        data={charts}
        keyExtractor={(chart) => chart.id.toString()}
        ListEmptyComponent={ListEmptyComponent}
        renderItem={(item) => (
          <ProgressionItem
            compact={compact}
            isPlaying={audioCtx.focusedAudioURL === item.item.audioURL}
            onPlay={() => setCurrentAudio([item.item, currentAudio[1] + 1])}
            chart={item.item}
            editChart={editChart}
            onDeleteChart={onDeleteChart}
          />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  controls: {
    marginBottom: 10,
  },
  emptyList: {
    padding: 20,
  },
});

export default withModalContext<ManualProps>(ProgressionList);
