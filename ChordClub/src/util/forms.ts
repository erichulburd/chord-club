import { ChartNew, ChartType, Note, ChartQuality } from "../types";


export const makeChartNew = (uid: string): Partial<ChartNew> => ({
  chartType: ChartType.Chord,
  audioURL: '',
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
