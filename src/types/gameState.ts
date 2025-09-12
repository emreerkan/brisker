import type { ScoreEntry } from './score';
import type { Player } from './player';

export interface GameState {
  total: number;
  brisk: number;
  history: ScoreEntry[];
  lastThreeScores: number[];
  currentOpponent?: Player;
}

export interface GameActions {
  addPoints: (points: number) => void;
  undo: () => void;
  reset: (skipConfirm?: boolean) => void;
  setBrisk: (brisk: number) => void;
}