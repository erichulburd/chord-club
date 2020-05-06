import React from 'react';
import { Chart, Extension } from '../types';
import { Card, Button, Spinner, StyleService } from '@ui-kitten/components';
import { View, ViewProps, StyleSheet } from 'react-native';
import { AudioPlayer } from './AudioPlayer1';
import { ThemedIcon } from './FontAwesomeIcons';
import { FlashcardSettings, FlashcardAnswer } from '../util/flashcards';
import { FlashcardQuality } from './FlashcardQuality';
import { FlashcardTone } from './FlashcardTone';
import { FlashcardExtensions } from './FlashcardExtensions';
import { GetExtensionsData } from '../gql/extension';
import { QueryResult } from 'react-apollo';
import ErrorText from './ErrorText';

interface Props {
  chart: Chart;
  flashcardSettings: FlashcardSettings;
  answer: FlashcardAnswer;
  revealed: boolean;
  extensions: QueryResult<GetExtensionsData, Record<string, any>>;
  reveal: () => void;
  next: () => void;
  back: () => void;
  updateAnswer: (answer: FlashcardAnswer) => void;
}

export const Flashcard = ({
  chart, reveal, next, back, flashcardSettings, answer, revealed,
  updateAnswer, extensions,
}: Props) => {
  const Footer = (props?: ViewProps) => (
    <View {...props} style={[props?.style, styles.footer]}>
      <Button
        appearance="outline"
        size="small"
        onPress={back}
        accessoryLeft={ThemedIcon('arrow-circle-left')}
      />
      <Button
        appearance="outline"
        size="small"
        disabled={revealed}
        onPress={reveal}
        accessoryLeft={ThemedIcon('eye')}
      />
      <Button
        appearance="outline"
        size="small"
        onPress={next}
        accessoryLeft={ThemedIcon('arrow-circle-right')}
      />
    </View>
  );
  const toggleExtension = (ext: Extension) => {
    const extensionAnswer = [...(answer.extensions || [])];
    const index = extensionAnswer.indexOf(ext);
    if (index >= 0) {
      extensionAnswer.splice(index, 1);
    } else {
      extensionAnswer.push(ext);
    }
    updateAnswer({ ...answer, extensions: extensionAnswer });
  }
  return (
    <Card
      disabled
      status="basic"
      footer={Footer}
    >
      <View>
        <AudioPlayer audio={chart} />
      </View>
      {flashcardSettings.quality &&
        <View>
          <FlashcardQuality
            userAnswer={answer.quality}
            expectedAnswer={chart.quality}
            revealed={revealed}
            onSelect={quality => updateAnswer({ ...answer, quality })}
          />
        </View>
      }
      {(flashcardSettings.tone && chart.root) &&
        <View>
          <FlashcardTone
            userAnswer={answer.tone}
            expectedAnswer={chart.root}
            revealed={revealed}
            onSelect={tone => updateAnswer({ ...answer, tone })}
          />
        </View>
      }
      {(flashcardSettings.extensions) &&
        <View>
          {extensions.loading && <Spinner />}
          {extensions.error && <ErrorText error={extensions.error} />}
          {extensions.data?.extensions &&
            <FlashcardExtensions
              extensions={extensions.data.extensions}
              userAnswer={answer.extensions || []}
              expectedAnswer={chart.extensions || []}
              revealed={revealed}
              onSelect={toggleExtension}
            />
          }
        </View>
      }
    </Card>
  );
};

const styles = StyleSheet.create({
  footer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
  }
});
