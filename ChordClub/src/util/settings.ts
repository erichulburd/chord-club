import { ChartQuery } from "../types";

export interface ChartViewSetting {
  query: ChartQuery;
  compact?: boolean
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

