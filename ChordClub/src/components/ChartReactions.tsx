import React from 'react';
import { Button } from '@ui-kitten/components';
import { ThemedIcon } from './FontAwesomeIcons';
import { ReactionType, Chart } from '../types';
import { View, StyleSheet } from 'react-native';
import { withAuth, AuthConsumerProps } from './AuthProvider';
import { useMutation } from 'react-apollo';
import { REACT_TO_CHART, ReactToChartResponse, ReactToChartVariables } from '../gql/chart';

interface ManualProps {
  chart: Chart;
}
interface Props extends ManualProps, AuthConsumerProps {}

const ChartReactions = ({ chart, authState }: Props) => {
  const { uid } = authState;
  const [reactToChart, reaction] = useMutation<ReactToChartResponse, ReactToChartVariables>(REACT_TO_CHART);
  const react = (reactionType: ReactionType) => {
    if (chart.createdBy === uid) {
      return;
    }
    if (reactionType === chart.userReactionType) {
      return;
    }
    reactToChart({ variables: {
      reactionNew: { chartID: chart.id, reactionType, uid  }
    }})
  };
  const userReactionType =  reaction.data?.react.userReactionType || chart.userReactionType;
  const starCount: number = reaction.data?.react.reactionCounts?.stars ||
    chart.reactionCounts.stars;
  return (
    <View style={styles.reactions}>
      <Button
        size="small"
        status="warning"
        disabled={reaction.loading}
        appearance={'ghost'}
        onPress={() => react(ReactionType.Star)}
        accessoryRight={
          ThemedIcon('star', {
            solid: userReactionType === ReactionType.Star,
          })
        }
      >{starCount}</Button>
      <Button
        size="small"
        status="danger"
        appearance={ 'ghost'}
        disabled={reaction.loading}
        onPress={() => react(ReactionType.Flag)}
        accessoryLeft={
          ThemedIcon('flag', {
            solid: userReactionType === ReactionType.Flag
          })
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  reactions: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
  },
})

export default withAuth<ManualProps>(ChartReactions);
