import type { PlayerSettings } from '../types/game';

import type { Player, ScoreEntry } from '../types/game';

const STORAGE_KEYS = {
  PLAYER_SETTINGS: 'bezique_player_settings'
} as const;

// Get player ID from server storage (separate from player settings)
const getServerAssignedPlayerID = (): string | null => {
  return localStorage.getItem('bezique_player_id');
};

// Game snapshot for quick resume (history, total, opponent, lastEvent)
export interface GameSnapshot {
  history: Array<Partial<ScoreEntry> & { timestamp: string }>;
  total: number;
  opponent?: Player | null;
  lastEvent: string; // ISO
}

const GAME_SNAPSHOT_KEY = 'bezique_game_snapshot';

export const saveGameSnapshot = (snapshot: GameSnapshot): void => {
  try {
    localStorage.setItem(GAME_SNAPSHOT_KEY, JSON.stringify(snapshot));
  } catch (error) {
    console.warn('Failed to save game snapshot to localStorage:', error);
  }
};

export const getGameSnapshot = (): GameSnapshot | null => {
  try {
    const raw = localStorage.getItem(GAME_SNAPSHOT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as GameSnapshot;
  } catch (error) {
    console.warn('Failed to load game snapshot from localStorage:', error);
    return null;
  }
};

export const clearGameSnapshot = (): void => {
  try {
    localStorage.removeItem(GAME_SNAPSHOT_KEY);
  } catch (error) {
    console.warn('Failed to clear game snapshot from localStorage:', error);
  }
};

// Get player settings from localStorage
export const getPlayerSettings = (): PlayerSettings => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.PLAYER_SETTINGS);
    if (stored) {
      const settings = JSON.parse(stored) as PlayerSettings;
      // Get player ID from server storage or use placeholder
      const serverPlayerID = getServerAssignedPlayerID();
      settings.playerID = serverPlayerID || settings.playerID || 'Offline';
      return settings;
    }
  } catch (error) {
    console.warn('Failed to load player settings from localStorage:', error);
  }

  // Default settings for new users
  const serverPlayerID = getServerAssignedPlayerID();
  const defaultSettings: PlayerSettings = {
    playerID: serverPlayerID || 'Offline',
    name: 'Player',
    soundEnabled: true
  };
  
  savePlayerSettings(defaultSettings);
  return defaultSettings;
};

// Save player settings to localStorage
export const savePlayerSettings = (settings: PlayerSettings): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.PLAYER_SETTINGS, JSON.stringify(settings));
  } catch (error) {
    console.warn('Failed to save player settings to localStorage:', error);
  }
};

// Update specific setting
export const updatePlayerSetting = <K extends keyof PlayerSettings>(
  key: K,
  value: PlayerSettings[K]
): void => {
  const settings = getPlayerSettings();
  settings[key] = value;
  savePlayerSettings(settings);
};

// Update player ID when assigned by server (this will trigger a refresh of settings)
export const updatePlayerIDFromServer = (playerID: string): void => {
  // This will be called by GameServerAPI when ID is assigned
  // The getPlayerSettings() function will automatically pick it up from bezique_player_id
  const settings = getPlayerSettings();
  settings.playerID = playerID;
  savePlayerSettings(settings);
};
