import { ChartNew, ChartType, Note, ChartQuality, BaseScopes, TagNew, TagType, UserNew, Extension, ExtensionType, ExtensionNew } from '../src/types';
import * as faker from 'faker';
import { sample } from 'lodash';

export const makeChartNew = (overrides: Partial<ChartNew> = {}): ChartNew => ({
  audioURL: faker.internet.url(),
  audioLength: 10,
  imageURL: faker.internet.url(),
  hint: faker.lorem.words(3),
  description: faker.lorem.words(3),
  abc: faker.lorem.words(3),
  scope: BaseScopes.Public,
  chartType: (sample(ChartType) || ChartType.Chord),
  bassNote: sample(Note) || Note.C,
  root: sample(Note) || Note.C,
  quality: sample(ChartQuality) || ChartQuality.Major,
  tags: [],
  extensionIDs: [],
  ...overrides
});

export const makeTagNew = (overrides: Partial<TagNew> = {}): TagNew => {
  const displayName = faker.lorem.words(3);
  return {
    displayName,
    tagType: sample(TagType) || TagType.Descriptor,
    scope: BaseScopes.Public,
    ...overrides
  };
};

export const makeUserNew = (overrides: Partial<UserNew> = {}): UserNew => ({
  username: faker.internet.userName(),
  ...overrides
});

export const makeExtension = (overrides: Partial<ExtensionNew> = {}): ExtensionNew => ({
  degree: faker.random.number(13),
  extensionType: sample(ExtensionType) || ExtensionType.Plain,
  ...overrides
});
