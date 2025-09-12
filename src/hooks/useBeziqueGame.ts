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
    history: []
  });
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [opponent, setOpponent] = useState<Player | undefined>();

  const addPoints = useCallback((points: number) => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    
    setTimeout(() => {
      setGameState(prev => {
        const newEntry: ScoreEntry = {
          value: points,
          type: ScoreEntryType.POINT,
          timestamp: new Date()
        };
        
        const newHistory = [...prev.history, newEntry];
        const newTotal = calculateTotalScore(newHistory);
        
        // Send score update to opponent if we have one
        if (opponent?.playerID) {
          GameServerAPI.sendScoreUpdate(opponent.playerID, newTotal);
        }
        
        // Check if we've reached 10000 points and trigger congratulations with ta-da sound
        if (prev.score < WIN_THRESHOLD && newTotal >= WIN_THRESHOLD && onCongratulations) {
          // Play ta-da sound for reaching 10000 points
          playSound(SoundType.TADA, soundEnabled);
          setTimeout(() => onCongratulations(), 100);
        } else {
          // Play regular sound for normal scoring
          playSound(SoundType.SCORE, soundEnabled);
        }
        
        return {
          ...prev,
          score: newTotal,
          history: newHistory
        };
      });
      
      setIsProcessing(false);
    }, 300);
  }, [isProcessing, soundEnabled, onCongratulations]);

  // Add brisk points (equivalent to regular points but marked as brisk type)
  const addPointsWithMeta = useCallback((points: number) => {
    if (isProcessing) return;
    setIsProcessing(true);

    setTimeout(() => {
      setGameState(prev => {
        const newEntry: ScoreEntry = {
          value: points,
          type: ScoreEntryType.BRISK,
          timestamp: new Date()
        };

        const newHistory = [...prev.history, newEntry];
        const newTotal = calculateTotalScore(newHistory);

        // Send score update to opponent if we have one
        if (opponent?.playerID) {
          GameServerAPI.sendScoreUpdate(opponent.playerID, newTotal);
        }

        // Play sounds accordingly
        if (prev.score < WIN_THRESHOLD && newTotal >= WIN_THRESHOLD && onCongratulations) {
          playSound(SoundType.TADA, soundEnabled);
          setTimeout(() => onCongratulations(), 100);
        } else {
          playSound(SoundType.SCORE, soundEnabled);
        }

        return {
          ...prev,
          score: newTotal,
          history: newHistory
        };
      });

      setIsProcessing(false);
    }, 300);
  }, [isProcessing, soundEnabled, onCongratulations]);

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

          const restoredLastThree = mappedHistory.slice(-3).map(entry => entry.value);

          setGameState(prev => ({
            ...prev,
            history: mappedHistory,
            total: snap.total,
            lastThreeScores: restoredLastThree,
            currentOpponent: snap.opponent || undefined
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
      try {
        GameServerAPI.updatePlayerState({
          playerID: (localStorage.getItem('bezique_player_id') || undefined),
          name: JSON.parse(localStorage.getItem('bezique_player_settings') || '{}').name,
          history: gameState.history,
          total: gameState.score,
          opponentID: opponent?.playerID,
        });
        // Save a local snapshot for quick resume
        try {
          const historySnapshot = gameState.history.map(h => ({ value: h.value, type: h.type, timestamp: h.timestamp.toISOString() })) as any;
          saveGameSnapshot({
            history: historySnapshot,
            total: gameState.score,
            opponent: opponent || null,
            lastEvent: new Date().toISOString()
          });
        } catch (e) {
          // ignore
        }
      } catch (e) {
        // ignore
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [gameState.history, gameState.score, opponent]);

  // Apply points locally without notifying server (used when server instructs the client to apply points)
  const addPointsLocal = useCallback((points: number, isBrisk: boolean = false) => {
    let newTotalForSend: number | undefined;
    let opponentToNotify: string | undefined;
    setGameState(prev => {
      const newEntry: ScoreEntry = {
        value: points,
        type: isBrisk ? ScoreEntryType.BRISK : ScoreEntryType.POINT,
        timestamp: new Date()
      };
      const newHistory = [...prev.history, newEntry];
      const newScore = calculateTotalScore(newHistory);

      // Capture values to send after state is applied
      newTotalForSend = newScore;
      opponentToNotify = opponent?.playerID;

      // Play sound for remote-driven scoring
      playSound(SoundType.SCORE, soundEnabled);

      return {
        ...prev,
        score: newScore,
        history: newHistory
      };
    });

    // Notify opponent of our new total
    if (opponentToNotify && typeof newTotalForSend === 'number') {
      setTimeout(() => GameServerAPI.sendScoreUpdate(opponentToNotify!, newTotalForSend!), 0);
    }
  }, [soundEnabled]);

  const undo = useCallback(() => {
    let newTotalForSend: number | undefined;
    let opponentToNotify: string | undefined;
    setGameState(prev => {
      if (prev.history.length === 0) return prev;

      const lastEntry = prev.history[prev.history.length - 1];

      // If the last entry is a brisk and we have an opponent, request opponent to undo as well
      const isBrisk = lastEntry.type === ScoreEntryType.BRISK;
      if (isBrisk && opponent?.playerID) {
        console.log('↩️ undo() detected brisk entry, requesting opponent undo', { lastEntry, opponent: opponent.playerID });
        // Ask server to forward an undo request to opponent for the same brisk value
        try {
          GameServerAPI.requestUndoOpponent(opponent.playerID, { points: lastEntry.value, briskValue: lastEntry.value });
        } catch (e) {
          console.warn('Failed to request opponent undo:', e);
        }
      }

      const newHistory = prev.history.slice(0, -1);
      const newScore = calculateTotalScore(newHistory);

      // capture values to notify opponent after state update
      newTotalForSend = newScore;
      opponentToNotify = opponent?.playerID;

      playSound(SoundType.UNDO, soundEnabled);

      return {
        ...prev,
        score: newScore,
        history: newHistory
      };
    });

    if (opponentToNotify && typeof newTotalForSend === 'number') {
      setTimeout(() => GameServerAPI.sendScoreUpdate(opponentToNotify!, newTotalForSend!), 0);
    }
  }, [soundEnabled, opponent]);

  // Undo locally without notifying the opponent (used when opponent requested undo)
  const undoLocal = useCallback(() => {
    let newTotalForSend: number | undefined;
    let opponentToNotify: string | undefined;
    setGameState(prev => {
      if (prev.history.length === 0) return prev;

      const newHistory = prev.history.slice(0, -1);
      const newScore = calculateTotalScore(newHistory);

      newTotalForSend = newScore;
      opponentToNotify = opponent?.playerID;

      playSound(SoundType.UNDO, soundEnabled);

      return {
        ...prev,
        score: newScore,
        history: newHistory
      };
    });

    if (opponentToNotify && typeof newTotalForSend === 'number') {
      setTimeout(() => GameServerAPI.sendScoreUpdate(opponentToNotify!, newTotalForSend!), 0);
    }
  }, [soundEnabled, opponent]);

  // Undo locally but only if the last entry matches the opponent's undo payload
  const undoLocalMatching = useCallback((payload?: { points?: number; briskValue?: number }) => {
    let newTotalForSend: number | undefined;
    let opponentToNotify: string | undefined;
    setGameState(prev => {
      if (prev.history.length === 0) return prev;

      const lastEntry = prev.history[prev.history.length - 1];

      if (payload && typeof payload.briskValue === 'number') {
        const lastIsBrisk = lastEntry.type === ScoreEntryType.BRISK;
        if (!lastIsBrisk) {
          console.log('Ignoring opponent brisk undo: last entry is not brisk', { lastEntry, payload });
          return prev;
        }
      }

      const newHistory = prev.history.slice(0, -1);
      const newScore = calculateTotalScore(newHistory);

      newTotalForSend = newScore;
      opponentToNotify = opponent?.playerID;

      playSound(SoundType.UNDO, soundEnabled);

      return {
        ...prev,
        score: newScore,
        history: newHistory
      };
    });

    if (opponentToNotify && typeof newTotalForSend === 'number') {
      setTimeout(() => GameServerAPI.sendScoreUpdate(opponentToNotify!, newTotalForSend!), 0);
    }
  }, [soundEnabled]);

  const reset = useCallback((skipConfirm: boolean = false) => {
    if (skipConfirm || window.confirm('Are you sure you want to reset the score?')) {
      // Reset only scores/history and keep opponent/connection intact
      resetLocal();

      // If we're connected to an opponent, ask server to forward a reset instruction
      try {
        const opponentID = opponent?.playerID;
        if (opponentID) {
          GameServerAPI.sendMessage({ type: 'game:reset', payload: { opponentID } });
        }
      } catch (e) {
        // ignore
      }
    }
  }, [soundEnabled, opponent?.playerID]);

  // Reset local score/history only (no server notifications)
  const resetLocal = useCallback(() => {
    let opponentToNotify: string | undefined;
    setGameState(prev => {
      opponentToNotify = opponent?.playerID;
      return {
        ...prev,
        score: 0,
        opponentScore: 0,
        history: []
      };
    });

    // Clear any saved snapshot so a reload doesn't restore old scores
    try {
      clearGameSnapshot();
    } catch (e) {
      // ignore
    }

    // Notify opponent our total is 0
    if (opponentToNotify) setTimeout(() => GameServerAPI.sendScoreUpdate(opponentToNotify!, 0), 0);

    playSound(SoundType.RESET, soundEnabled);
  }, [soundEnabled]);

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
    console.warn('setBrisk is deprecated. Use addPointsWithMeta with type BRISK instead.');
  }, []);

  return {
    gameState,
    isProcessing,
    addPoints,
    addPointsWithMeta,
    undo,
    undoLocal,
    undoLocalMatching,
    reset,
    resetLocal,
    addPointsLocal,
    setBrisk,
    setCurrentOpponent,
    updateOpponentScore,
    // Utility functions for derived values
    getLastThreeScores: () => getLastThreeScores(gameState.history),
    opponent
  };
};
