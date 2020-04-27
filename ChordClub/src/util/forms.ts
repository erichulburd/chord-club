import { ChartNew, ChartType, ChartQuality, BaseScopes, TagNew, TagType, Tag } from "../types";
import kebabCase from 'lodash/kebabCase';

export const makeChartNew = (uid: string): Partial<ChartNew> => ({
  chartType: ChartType.Chord,
  audioURL: '',
  audioLength: 0,
  imageURL: '',
  notes: '',
  hint: '',
  bassNote: '',
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

export const getTagKey = (t: Tag | TagNew) => `${t.scope}-${kebabCase(t.displayName)}`
export const areTagsEqual = (t1: Tag, t2: TagNew) => {
  return getTagKey(t1) === getTagKey(t2);
};
