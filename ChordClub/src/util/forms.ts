import { ChartNew, ChartType, ChartQuality } from "../types";


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
