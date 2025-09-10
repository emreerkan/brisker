export interface ScoreEntry {
  id: string;
  points: number;
  timestamp: Date;
}

export interface GameState {
  total: number;
  brisk: number;
  history: ScoreEntry[];
  lastThreeScores: number[];
}

export interface WindowSize {
  width: number;
  height: number;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface GameActions {
  addPoints: (points: number) => void;
  undo: () => void;
  reset: (skipConfirm?: boolean) => void;
  setBrisk: (brisk: number) => void;
}
