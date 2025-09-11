import type { PlayerSettings } from '../types/game';

const STORAGE_KEYS = {
  PLAYER_SETTINGS: 'bezique_player_settings'
} as const;

// Generate a unique player ID
const generatePlayerID = (): string => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `player_${timestamp}_${randomStr}`;
};

// Get player settings from localStorage
export const getPlayerSettings = (): PlayerSettings => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.PLAYER_SETTINGS);
    if (stored) {
      const settings = JSON.parse(stored) as PlayerSettings;
      // Ensure we have a playerID (for existing users)
      if (!settings.playerID) {
        settings.playerID = generatePlayerID();
        savePlayerSettings(settings);
      }
      return settings;
    }
  } catch (error) {
    console.warn('Failed to load player settings from localStorage:', error);
  }

  // Default settings for new users
  const defaultSettings: PlayerSettings = {
    playerID: generatePlayerID(),
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
