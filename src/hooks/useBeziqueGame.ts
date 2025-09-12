import { useState, useCallback } from 'react';
import type { ScoreEntry, GameState, Player } from '@/types';
import { ScoreEntryType } from '@/types';
import { WIN_THRESHOLD } from '@/utils/constants';
import { GameServerAPI } from '@/services/gameServer';
import { saveGameSnapshot, getGameSnapshot, clearGameSnapshot } from '@/utils/localStorage';
import { playSound, SoundType } from '@/utils/soundManager';
import { useEffect } from 'react';

// Utility function to get last three scores from history
const getLastThreeScores = (history: ScoreEntry[]): number[] => {
  return history.slice(-3).map(entry => entry.value);
};

// Utility function to calculate total score from history
const calculateTotalScore = (history: ScoreEntry[]): number => {
  return history.reduce((sum, entry) => sum + entry.value, 0);
};

export const useBeziqueGame = (soundEnabled: boolean = true, onCongratulations?: () => void) => {
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    opponentScore: 0,
    history: [],
    isDealer: false,
    opponentIsDealer: false
  });
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [opponent, setOpponent] = useState<Player | undefined>();

  // Check if player is online (has an opponent)
  const isOnline = useCallback(() => {
    return opponent !== undefined && opponent.playerID !== undefined;
  }, [opponent]);

  const addPoints = useCallback((points: number, type: ScoreEntryType = ScoreEntryType.POINT, isRemote: boolean = false) => {
    if (isProcessing && !isRemote) return;
    
    if (!isRemote) setIsProcessing(true);
    
    setTimeout(() => {
      setGameState(prev => {
        const newEntry: ScoreEntry = {
          value: points,
          type: type,
          timestamp: new Date()
        };
        
        const newHistory = [...prev.history, newEntry];
        const newTotal = calculateTotalScore(newHistory);
        
        // Send score update to opponent if we're online
        // Always notify opponent of our score changes, even for remote updates
        if (isOnline()) {
          GameServerAPI.sendScoreUpdate(opponent!.playerID, newTotal);
        }
        
        // Check if we've reached 10000 points and trigger congratulations with ta-da sound
        if (prev.score < WIN_THRESHOLD && newTotal >= WIN_THRESHOLD && onCongratulations) {
          // Play ta-da sound for reaching 10000 points
          playSound(SoundType.TADA, soundEnabled);
          setTimeout(() => onCongratulations(), 100);
        } else {
          // Play appropriate sound
          if (isRemote) {
            playSound(SoundType.SCORE, soundEnabled);
          } else {
            playSound(SoundType.SCORE, soundEnabled);
          }
        }
        
        // Handle dealer switching when a brisk is entered
        let newIsDealer = prev.isDealer;
        let newOpponentIsDealer = prev.opponentIsDealer;
        
        if (type === ScoreEntryType.BRISK) {
          if (isRemote) {
            // When opponent enters brisk (remote), they're indicating we were the dealer
            newIsDealer = true;
            newOpponentIsDealer = false;
          } else {
            // When player enters brisk locally, they're indicating opponent was the dealer
            newIsDealer = false;
            newOpponentIsDealer = true;
          }
        }
        
        return {
          ...prev,
          score: newTotal,
          history: newHistory,
          isDealer: newIsDealer,
          opponentIsDealer: newOpponentIsDealer
        };
      });
      
      if (!isRemote) setIsProcessing(false);
    }, isRemote ? 0 : 300);
  }, [isProcessing, soundEnabled, onCongratulations, isOnline, opponent]);

  // On mount, ensure websocket connection (with retry) and sync state
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const id = await GameServerAPI.connectWithRetry();
        if (cancelled) return;
        // push local stored player settings (name) as needed
        const settings = JSON.parse(localStorage.getItem('bezique_player_settings') || '{}');
        GameServerAPI.updatePlayerState({ playerID: id, name: settings.name || `Player ${id}` });
      } catch (e) {
        console.warn('Could not connect to server on mount:', e);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  // Attempt to restore recent game snapshot from localStorage on mount
  useEffect(() => {
    (async () => {
      try {
        const snap = getGameSnapshot();
        if (!snap) return;
        const lastEvent = new Date(snap.lastEvent);
        const now = new Date();
        const diffMs = now.getTime() - lastEvent.getTime();
        const tenMinutesMs = 10 * 60 * 1000;
        if (diffMs <= tenMinutesMs) {
          // Build mapped history entries and last three scores for UI
          const mappedHistory = snap.history.map((h: any) => ({
            value: (h.value || h.points) as number || 0,
            type: h.type || (h.isBrisk ? ScoreEntryType.BRISK : ScoreEntryType.POINT),
            timestamp: new Date(h.timestamp)
          })) as ScoreEntry[];

          setGameState(prev => ({
            ...prev,
            history: mappedHistory,
            score: snap.total,
            isDealer: snap.isDealer || false,
            opponentIsDealer: snap.opponentIsDealer || false
          }));

          // Wait for websocket to be connected before syncing snapshot to server
          try {
            const id = await GameServerAPI.connectWithRetry();
            const playerID = localStorage.getItem('bezique_player_id') || id || undefined;
            GameServerAPI.updatePlayerState({ playerID, name: JSON.parse(localStorage.getItem('bezique_player_settings') || '{}').name, history: snap.history, total: snap.total, opponentID: snap.opponent?.playerID });
          } catch (e) {
            // ignore
          }
        } else {
          // Too old, clear
          clearGameSnapshot();
        }
      } catch (e) {
        console.warn('Failed to restore game snapshot:', e);
      }
    })();
  }, []);

  // Whenever important state changes, notify server (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isOnline()) {
        try {
          GameServerAPI.updatePlayerState({
            playerID: (localStorage.getItem('bezique_player_id') || undefined),
            name: JSON.parse(localStorage.getItem('bezique_player_settings') || '{}').name,
            history: gameState.history,
            total: gameState.score,
            opponentID: opponent?.playerID,
          });
        } catch (e) {
          // ignore
        }
      }
      // Save a local snapshot regardless of online status
      try {
        const historySnapshot = gameState.history.map(h => ({ value: h.value, type: h.type, timestamp: h.timestamp.toISOString() })) as any;
        saveGameSnapshot({
          history: historySnapshot,
          total: gameState.score,
          opponent: opponent || null,
          lastEvent: new Date().toISOString(),
          isDealer: gameState.isDealer,
          opponentIsDealer: gameState.opponentIsDealer
        });
      } catch (e) {
        // ignore
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [gameState.history, gameState.score, opponent]);

  const undo = useCallback((payload?: { points?: number; briskValue?: number }, isRemote: boolean = false) => {
    let newTotalForSend: number | undefined;
    let opponentToNotify: string | undefined;
    
    setGameState(prev => {
      if (prev.history.length === 0) return prev;

      const lastEntry = prev.history[prev.history.length - 1];

      // If payload is provided (remote undo), validate it matches the last entry
      if (payload && typeof payload.briskValue === 'number') {
        const lastIsBrisk = lastEntry.type === ScoreEntryType.BRISK;
        if (!lastIsBrisk) {
          console.log('Ignoring opponent brisk undo: last entry is not brisk', { lastEntry, payload });
          return prev;
        }
      }

      // If this is a user-initiated undo (not remote) and the last entry is a brisk and we're online,
      // request opponent to undo as well
      const isBrisk = lastEntry.type === ScoreEntryType.BRISK;
      if (!isRemote && isBrisk && isOnline()) {
        console.log('↩️ undo() detected brisk entry, requesting opponent undo', { lastEntry, opponent: opponent!.playerID });
        try {
          GameServerAPI.requestUndoOpponent(opponent!.playerID, { points: lastEntry.value, briskValue: lastEntry.value });
        } catch (e) {
          console.warn('Failed to request opponent undo:', e);
        }
      }

      const newHistory = prev.history.slice(0, -1);
      const newScore = calculateTotalScore(newHistory);

      // Only send score update if this is user-initiated and we're online
      if (!isRemote && isOnline()) {
        newTotalForSend = newScore;
        opponentToNotify = opponent?.playerID;
      }

      playSound(SoundType.UNDO, soundEnabled);

      // Handle dealer status when undoing a brisk
      let newIsDealer = prev.isDealer;
      let newOpponentIsDealer = prev.opponentIsDealer;
      
      if (isBrisk) {
        // Check if there are any previous brisk entries to determine dealer status
        const previousBriskEntries = newHistory.filter(entry => entry.type === ScoreEntryType.BRISK);
        if (previousBriskEntries.length === 0) {
          // No more brisk entries, reset dealer status
          newIsDealer = false;
          newOpponentIsDealer = false;
        } else {
          // When undoing a brisk, we reset dealer status since determining the previous dealer
          // would require tracking who entered each brisk entry (player vs opponent)
          // For simplicity, we reset to no dealer after undo
          newIsDealer = false;
          newOpponentIsDealer = false;
        }
      }

      return {
        ...prev,
        score: newScore,
        history: newHistory,
        isDealer: newIsDealer,
        opponentIsDealer: newOpponentIsDealer
      };
    });

    // Send score update to opponent if needed
    if (!isRemote && isOnline() && opponentToNotify && typeof newTotalForSend === 'number') {
      setTimeout(() => GameServerAPI.sendScoreUpdate(opponentToNotify!, newTotalForSend!), 0);
    }
  }, [soundEnabled, opponent, isOnline]);

  const reset = useCallback((skipConfirm: boolean = false, isRemote: boolean = false) => {
    if (!isRemote && !skipConfirm && !window.confirm('Are you sure you want to reset the score?')) {
      return;
    }

    let opponentToNotify: string | undefined;
    setGameState(prev => {
      opponentToNotify = opponent?.playerID;
      return {
        ...prev,
        score: 0,
        opponentScore: 0,
        history: [],
        isDealer: false,
        opponentIsDealer: false
      };
    });

    // Clear any saved snapshot so a reload doesn't restore old scores
    try {
      clearGameSnapshot();
    } catch (e) {
      // ignore
    }

    // If this is user-initiated and we're online, ask server to forward a reset instruction
    if (!isRemote && isOnline()) {
      try {
        GameServerAPI.sendMessage({ type: 'game:reset', payload: { opponentID: opponent!.playerID } });
      } catch (e) {
        // ignore
      }
    }

    // Notify opponent our total is 0 if we're online and this isn't remote
    if (!isRemote && isOnline() && opponentToNotify) {
      setTimeout(() => GameServerAPI.sendScoreUpdate(opponentToNotify!, 0), 0);
    }

    playSound(SoundType.RESET, soundEnabled);
  }, [soundEnabled, isOnline, opponent]);

  const setCurrentOpponent = useCallback((newOpponent: Player | undefined) => {
    setOpponent(newOpponent);
  }, []);

  const updateOpponentScore = useCallback((newScore: number) => {
    setGameState(prev => ({
      ...prev,
      opponentScore: newScore
    }));
  }, []);

  const setBrisk = useCallback((_briskValue: number) => {
    // setBrisk is deprecated with the new GameState structure
    // Brisk points are now just entries in history with type BRISK
    console.warn('setBrisk is deprecated. Use addPoints with ScoreEntryType.BRISK instead.');
  }, []);

  return {
    gameState,
    isProcessing,
    addPoints,
    undo,
    reset,
    setBrisk,
    setCurrentOpponent,
    updateOpponentScore,
    // Utility functions for derived values
    getLastThreeScores: () => getLastThreeScores(gameState.history),
    opponent,
    isOnline
  };
};
