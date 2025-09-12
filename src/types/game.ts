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

export interface GameState {
  total: number;
  brisk: number;
  history: ScoreEntry[];
  lastThreeScores: number[];
  currentOpponent?: Player;
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

export interface Player {
  playerID: string;
  name: string;
  score?: number; // for tracking opponent score
  distance?: number; // for geolocation search
  isOnline?: boolean; // for WebSocket connection status
}

export interface PlayerSettings {
  playerID: string;
  name: string;
  soundEnabled: boolean;
}

export interface GeolocationData {
  latitude: number;
  longitude: number;
}
