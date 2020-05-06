import React, { useState, useEffect } from 'react';
import { ChartQuery } from '../types';
import { CHARTS_QUERY, ChartsQueryResponse, ChartsQueryVariables } from '../gql/chart';
import { useQuery } from 'react-apollo';
import { FlashcardsScores } from './FlashcardsScores';
import { View } from 'react-native';
import { Flashcard } from './Flashcard';
import { FlashcardsSettings } from './FlashcardsSettings';
import { Spinner, Button, Text } from '@ui-kitten/components';
import { FlashcardAnswer, FlashcardSettings, isAnswerCorrect } from '../util/flashcards';
import { GET_EXTENSIONS, GetExtensionsData } from '../gql/extension';
import omit from 'lodash/omit';


interface Props {
  query: ChartQuery;
}

export const Flashcards = ({ query }: Props) => {
  const extensionsResult = useQuery<GetExtensionsData>(GET_EXTENSIONS);
  const { data, loading, refetch } = useQuery<
    ChartsQueryResponse,
    ChartsQueryVariables
  >(CHARTS_QUERY, {
    variables: {
      query: omit(query, ['__typename']),
    },
  });
  const [settings, setFlashcardSettings] = useState<FlashcardSettings>({
    quality: true,
    tone: false,
    extensions: false,
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
  useEffect(() => {
    const chartsLength = data?.charts.length;
    if (chartsLength === undefined) return;
    if (chartsLength < queryLimit) {
      setScores(scores.slice(0, data?.charts.length));
      setAnswers(answers.slice(0, data?.charts.length));
    }
  }, [data?.charts.length])

  const revealed = chartIndex !== undefined && scores[chartIndex] !== undefined;
  const updateAnswer = (a: FlashcardAnswer) => {
    if (chartIndex === undefined || revealed) return;
    const update = [...answers];
    update[chartIndex] = a;
    setAnswers(update);
  }
  const reveal = () => {
    if (chartIndex === undefined) return;
    const isCorrect = isAnswerCorrect(answers[chartIndex], charts[chartIndex], settings);
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
    refetch().catch((err) => console.error(err));
  }
  if (loading) {
    return (
      <View>
        <Spinner />
      </View>
    );
  }
  return (
    <View>
      {chartIndex === undefined && (
        <>
          <FlashcardsSettings
            settings={settings}
            setFlashcardSettings={setFlashcardSettings}
          />
          <Button
            size="giant"
            appearance="outline"
            onPress={() => setChartIndex(0)}
          >Begin!</Button>
        </>
      )}
      {(chartIndex !== undefined && chartIndex < scores.length) && (
        <>
          <FlashcardsScores currentIndex={chartIndex} scores={scores} />
          <Flashcard
            extensions={extensionsResult}
            revealed={revealed}
            chart={charts[chartIndex]}
            next={next}
            reveal={reveal}
            answer={answers[chartIndex]}
            updateAnswer={updateAnswer}
            flashcardSettings={settings}
          />
        </>
      )}
      {chartIndex === scores.length && (
        <View>
          <Text category="h1">{getTotalScore(scores)}%</Text>
          <Button
            size="giant"
            appearance="outline"
            onPress={reset}
          >Go Again!</Button>
        </View>
      )}
    </View>

  );
};

const getTotalScore = (scores: (boolean | undefined)[]) => {
  const correctCt = scores.reduce((prev, score) => prev + (score === true ? 1 : 0), 0);
  const total = scores.reduce((prev) => prev + 1, 0);
  return Math.round(100 * correctCt / total).toString();
}
