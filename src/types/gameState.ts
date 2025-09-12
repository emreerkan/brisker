import type { ScoreEntry } from './score';

export interface GameState {
  score: number;
  opponentScore: number;
  history: ScoreEntry[];
}

export interface GameActions {
  addPoints: (points: number) => void;
  undo: () => void;
  reset: (skipConfirm?: boolean) => void;
  setBrisk: (brisk: number) => void;
}