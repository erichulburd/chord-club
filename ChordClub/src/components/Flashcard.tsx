import React from 'react';
import { Chart, Extension } from '../types';
import { Card, Button, Spinner, Text } from '@ui-kitten/components';
import { View, ViewProps, StyleSheet } from 'react-native';
import { AudioPlayer } from './AudioPlayer';
import { ThemedIcon } from './FontAwesomeIcons';
import { FlashcardAnswer } from '../util/flashcards';
import { FlashcardQuality } from './FlashcardQuality';
import { FlashcardTone } from './FlashcardTone';
import { FlashcardExtensions } from './FlashcardExtensions';
import { GetExtensionsData } from '../gql/extension';
import { QueryResult } from 'react-apollo';
import ErrorText from './ErrorText';
import { FlashcardOptions } from '../util/settings';

interface Props {
  chart: Chart;
  options: FlashcardOptions;
  answer: FlashcardAnswer;
  score: boolean | undefined;
  extensions: QueryResult<GetExtensionsData, Record<string, any>>;
  headerContent: React.ReactElement;
  reveal: () => void;
  next: () => void;
  back: () => void;
  updateAnswer: (answer: FlashcardAnswer) => void;
}

export const Flashcard = ({
  chart, reveal, next, back, options, answer, score,
  updateAnswer, extensions, headerContent,
}: Props) => {
  const Header = (props?: ViewProps) => (
    <View {...props} style={[props?.style, styles.header]}>{headerContent}</View>
  );
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
        disabled={score !== undefined}
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
  let status = 'basic';
  if (score === false) {
    status = 'danger';
  } else if (score === true) {
    status = 'success';
  }
  return (
    <Card
      disabled
      status={status}
      header={Header}
      footer={Footer}
    >
      <View>
        <AudioPlayer audio={chart} />
      </View>
      {(options.tone && chart.root) &&
        <View>
          <Text style={styles.label} category="label">Tone</Text>
          <FlashcardTone
            userAnswer={answer.tone}
            expectedAnswer={chart.root}
            revealed={score !== undefined}
            onSelect={tone => updateAnswer({ ...answer, tone })}
          />
        </View>
      }
      {options.quality &&
        <View>
          <Text style={styles.label} category="label">Quality</Text>
          <FlashcardQuality
            userAnswer={answer.quality}
            expectedAnswer={chart.quality}
            revealed={score !== undefined}
            onSelect={quality => updateAnswer({ ...answer, quality })}
          />
        </View>
      }
      {(options.extensions) &&
        <View>
         <Text style={styles.label} category="label">Extensions</Text>
          {extensions.loading && <Spinner />}
          {extensions.error && <ErrorText error={extensions.error} />}
          {extensions.data?.extensions &&
            <FlashcardExtensions
              extensions={extensions.data.extensions}
              userAnswer={answer.extensions || []}
              expectedAnswer={chart.extensions || []}
              revealed={score !== undefined}
              onSelect={toggleExtension}
            />
          }
        </View>
      }
    </Card>
  );
};

const styles = StyleSheet.create({
  header: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  footer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  label: {
    marginTop: 5,
    marginBottom: 5,
  }
});
