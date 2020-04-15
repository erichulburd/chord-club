import { ChartNew, ChartType, Note, ChartQuality } from '../src/types';
import * as faker from 'faker';
import { sample } from 'lodash';

const bools = [true, false];

export const makeChartNew = (overrides: Partial<ChartNew> = {}): ChartNew => ({
  audioURL: faker.internet.url(),
  imageURL: faker.internet.url(),
  hint: faker.lorem.words(3),
  notes: faker.lorem.words(3),
  abc: faker.lorem.words(3),
  public: Boolean(sample(bools)),
  chartType: (sample(ChartType) || ChartType.Chord),
  bassNote: faker.lorem.words(3),
  root: sample(Note) || Note.C,
  quality: sample(ChartQuality) || ChartQuality.Major,
  tags: [],
  extensionIDs: [],
  ...overrides
});
