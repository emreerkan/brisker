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