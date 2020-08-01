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
import id from 'lodash/has';
import has from 'lodash/has';

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

const isSavedTag = (t: Tag | TagNew) => {
  return has(t, 'id');
}

export const areTagsEqual = (t1: Tag | TagNew, t2: Tag | TagNew, uid: string) => {
  if (getTagMunge(t1.displayName) !== getTagMunge(t2.displayName)) {
    return false;
  }
  let t1CreatedBy = uid;
  let t2CreatedBy = uid;
  if (isSavedTag(t1)) {
    t1CreatedBy = (t1 as Tag).createdBy;
  }
  if (isSavedTag(t2)) {
    t2CreatedBy = (t2 as Tag).createdBy;
  }
  return t1CreatedBy === t2CreatedBy;
};
