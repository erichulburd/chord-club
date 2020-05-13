import {ChartQuality, Extension, Note, Chart} from 'src/types';
import {FlashcardOptions} from './settings';

export interface FlashcardAnswer {
  quality?: ChartQuality;
  extensions?: Extension[];
  tone?: Note;
}

export const getAnswerAppearance = <T>(
  option: T,
  userAnswer: T | undefined | T[],
) => {
  if (answerIncludes(option, userAnswer)) {
    return 'filled';
  }
  return 'outline';
};

export const getAnswerStatus = <T>(
  option: T,
  userAnswer: T | undefined | T[],
  expectedAnswer: T | T[],
  revealed: boolean,
) => {
  const isSelected = answerIncludes(option, userAnswer);
  const isCorrect = answerIncludes(option, expectedAnswer);
  if (isSelected) {
    if (!revealed) {
      return 'basic';
    } else if (isCorrect) {
      return 'success';
    }
    return 'danger';
  } else if (revealed) {
    if (isCorrect) {
      return 'danger';
    }
  }
  return 'basic';
};

const answerIncludes = <T>(
  userAnswer: T | undefined | T[],
  expectedAnswer: T | T[],
) => {
  if (expectedAnswer instanceof Array && userAnswer instanceof Array) {
    return userAnswer.some((a) =>
      expectedAnswer.some((expected) => expected === a),
    );
  } else if (
    userAnswer instanceof Array &&
    !(expectedAnswer instanceof Array)
  ) {
    return userAnswer.some((a) => a === expectedAnswer);
  } else if (
    expectedAnswer instanceof Array &&
    !(userAnswer instanceof Array)
  ) {
    return expectedAnswer.some((a) => a === userAnswer);
  }
  return userAnswer === expectedAnswer;
};

export const isAnswerCorrect = (
  answer: FlashcardAnswer,
  chart: Chart,
  settings: FlashcardOptions,
) => {
  if (settings.tone && answer.tone !== chart.root) {
    return false;
  }
  if (settings.quality && answer.quality !== chart.quality) {
    return false;
  }
  if (settings.extensions) {
    return isArrayAnswerCorrect(
      answer.extensions || [],
      chart.extensions || [],
    );
  }
  return true;
};

const isArrayAnswerCorrect = <T>(userAnswer: T[], expectedAnswer: T[]) => {
  if (userAnswer.length !== expectedAnswer.length) {
    return false;
  }
  return userAnswer.every((a) =>
    expectedAnswer.some((expected) => expected === a),
  );
};
