export const ScoreEntryType = {
  POINT: 'point',
  BRISK: 'brisk'
} as const;

export type ScoreEntryType = typeof ScoreEntryType[keyof typeof ScoreEntryType];

export interface ScoreEntry {
  value: number;
  type: ScoreEntryType;
  timestamp: Date;
}