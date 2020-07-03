import {
  ChartNew,
  ChartType,
  ChartQuality,
  TagNew,
  TagType,
  Tag,
} from '../types';
import kebabCase from 'lodash/kebabCase';
import trim from 'lodash/trim';

export const makeChartNew = (
  uid: string,
  overrides: Partial<ChartNew> = {},
): Partial<ChartNew> => ({
  chartType: ChartType.Chord,
  audioURL: '',
  audioLength: 0,
  imageURL: '',
  description: '',
  hint: '',
  abc: '',
  quality: ChartQuality.Major,
  extensionIDs: [],
  tags: [],
  ...overrides,
});

export interface ChartURLs extends Record<string, string> {
  imageURL: string;
  audioURL: string;
}

export const makeTagNew = (
  displayName: string,
): TagNew => ({
  displayName,
  tagType: TagType.List,
});

export const getTagMunge = (displayName: string) => {
  return kebabCase(trim(displayName).toLowerCase());
};

export const getTagKey = (t: Tag | TagNew) =>
  getTagMunge(t.displayName);

export const areTagsEqual = (t1: Tag | TagNew, t2: Tag | TagNew) => {
  return getTagKey(t1) === getTagKey(t2);
};
