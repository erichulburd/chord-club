import React, { useState, useEffect } from 'react';
import { ChartQuery, Chart } from '../types';
import { CHARTS_QUERY, ChartsQueryResponse, ChartsQueryVariables } from '../gql/chart';
import { useQuery } from 'react-apollo';
import { FlashcardsScores } from './FlashcardsScores';
import { View, StyleSheet } from 'react-native';
import { Flashcard } from './Flashcard';
import FlashcardsOptionsSelect from './FlashcardsOptionsSelect';
import { Spinner } from '@ui-kitten/components';
import { FlashcardAnswer, isAnswerCorrect } from '../util/flashcards';
import { GET_EXTENSIONS, GetExtensionsData } from '../gql/extension';
import omit from 'lodash/omit';
import { FlashcardTotalScore } from './FlashcardTotalScore';
import { FlashcardOptions } from '../util/settings';


interface Props {
  query: ChartQuery;
  options: FlashcardOptions;
}

export const Flashcards = ({ query, options }: Props) => {
  const extensionsResult = useQuery<GetExtensionsData>(GET_EXTENSIONS);
  const { data, loading, refetch } = useQuery<
    ChartsQueryResponse,
    ChartsQueryVariables
  >(CHARTS_QUERY, {
    variables: {
      query: omit(query, ['__typename']) as ChartQuery,
    },
  });
  const [chartIndex, setChartIndex] = useState<number | undefined>(undefined);
  const queryLimit = (query.limit === null || query.limit === undefined) ? 10 : query.limit;
  const [scores, setScores] = useState<(boolean | undefined)[]>(
    Array.apply(null, Array(query.limit)).map(() => undefined));
  const [answers, setAnswers] = useState<FlashcardAnswer[]>(
    Array.apply(null, Array(query.limit)).map(() => ({
      extensions: [],
    })));
  const charts = (data?.charts || []);
  const chartIDs = charts.map((c: Chart) => c.id);
  useEffect(() => {
    if (chartIndex === undefined) return;
    reset();
  }, [chartIDs.join(',')]);
  useEffect(() => {
    const chartsLength = data?.charts.length;
    if (chartsLength === undefined) return;
    if (chartsLength < queryLimit) {
      setScores(scores.slice(0, data?.charts.length));
      setAnswers(answers.slice(0, data?.charts.length));
    }
  }, [data?.charts.length]);

  const revealed = chartIndex !== undefined && scores[chartIndex] !== undefined;
  const updateAnswer = (a: FlashcardAnswer) => {
    if (chartIndex === undefined || revealed) return;
    const update = [...answers];
    update[chartIndex] = a;
    setAnswers(update);
  }
  const reveal = () => {
    if (chartIndex === undefined) return;
    const isCorrect = isAnswerCorrect(answers[chartIndex], charts[chartIndex], options);
    const scoreUpdate = [...scores];
    scoreUpdate[chartIndex] = isCorrect;
    setScores(scoreUpdate);
  };
  const back = () => {
    if (chartIndex === undefined) return;
    if (chartIndex === 0) {
      setChartIndex(undefined);
      return;
    }
    setChartIndex(chartIndex - 1);
  }
  const next = () => {
    if (chartIndex === undefined) return;
    if (scores[chartIndex] === undefined) {
      reveal();
    }
    setChartIndex(chartIndex+1);
  };
  const reset = () => {
    setChartIndex(undefined);
    setScores(scores.map(() => undefined));
    setAnswers(answers.map(() => ({
      extensions: [],
    })));
    refetch().catch((err: Error) => console.error(err));
  }
  if (loading) {
    return (
      <View>
        <Spinner />
      </View>
    );
  }
  return (
    <View style={styles.container}>
      {chartIndex === undefined && (
        <FlashcardsOptionsSelect
          options={options}
          done={() => setChartIndex(0)}
        />
      )}
      {(chartIndex !== undefined && chartIndex < scores.length) && (
        <Flashcard
          extensions={extensionsResult}
          score={scores[chartIndex]}
          chart={charts[chartIndex]}
          headerContent={<FlashcardsScores currentIndex={chartIndex} scores={scores} />}
          next={next}
          back={back}
          reveal={reveal}
          answer={answers[chartIndex]}
          updateAnswer={updateAnswer}
          options={options}
        />
      )}
      {chartIndex === scores.length && (
        <FlashcardTotalScore
          reset={reset}
          scores={scores}
        />
      )}
    </View>

  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 10,
    paddingLeft: 10,
    paddingRight: 10,
  }
});
