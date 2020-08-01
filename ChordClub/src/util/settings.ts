import {ChartQuery} from '../types';

interface LegacyQuery extends ChartQuery, Record<string, any> {}

export interface ChartViewSetting {
  query: LegacyQuery;
  compact?: boolean;
}

export interface FlashcardOptions {
  quality: boolean;
  extensions: boolean;
  tone: boolean;
}

export interface FlashcardViewSetting extends ChartViewSetting {
  options: FlashcardOptions;
}

export interface UserSettings {
  chords: ChartViewSetting;
  progressions: ChartViewSetting;
  flashcards: FlashcardViewSetting;
}

export type SettingsPath = keyof UserSettings;
