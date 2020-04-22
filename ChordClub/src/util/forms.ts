import { ChartNew, ChartType, Note, ChartQuality } from "../types";


export const makeChartNew = (uid: string): ChartNew => ({
  chartType: ChartType.Chord,
  audioURL: '',
  imageURL: '',
  notes: '',
  hint: '',
  bassNote: '',
  abc: '',
  scope: uid,
  root: Note.C,
  quality: ChartQuality.Major,
  extensionIDs: [],
  tags: [],
});
