import { ChartNew, ChartType, ChartQuality, BaseScopes, TagNew, TagType, Tag } from "../types";
import kebabCase from 'lodash/kebabCase';
import trim from 'lodash/trim';

export const makeChartNew = (uid: string): Partial<ChartNew> => ({
  chartType: ChartType.Chord,
  audioURL: '',
  audioLength: 0,
  imageURL: '',
  description: '',
  hint: '',
  abc: '',
  scope: uid,
  quality: ChartQuality.Major,
  extensionIDs: [],
  tags: [],
});

export interface  ChartURLs extends Record<string, string> {
  imageURL: string;
  audioURL: string;
}

export const makeTagNew = (displayName: string, isPublic: boolean, uid: string): TagNew => {
  const scope = isPublic ? BaseScopes.Public : uid
  return {
    displayName,
    scope,
    tagType: TagType.List,
  };
}

export const getTagMunge = (displayName: string) => {
  return kebabCase(trim(displayName).toLowerCase())
}

export const getTagKey = (t: Tag | TagNew) => `${t.scope}-${getTagMunge(t.displayName)}`
export const areTagsEqual = (t1: Tag | TagNew, t2: Tag | TagNew) => {
  return getTagKey(t1) === getTagKey(t2);
};
