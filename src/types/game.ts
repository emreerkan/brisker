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
