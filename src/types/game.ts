export interface ScoreEntry {
  id: string;
  points: number;
  timestamp: Date;
  // Optional metadata to mark special entries (brisk, remote-applied, origin info)
  isBrisk?: boolean;
  briskValue?: number; // original brisk selection (0-32)
  source?: 'local' | 'remote';
  from?: string; // playerID of origin when remote
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
