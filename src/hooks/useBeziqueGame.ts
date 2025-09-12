import { useState, useCallback } from 'react';
import type { ScoreEntry, GameState, Player } from '../types/game';
import { WIN_THRESHOLD } from '../utils/constants';
import { GameServerAPI } from '../services/gameServer';
import { saveGameSnapshot, getGameSnapshot, clearGameSnapshot } from '../utils/localStorage';
import { useEffect } from 'react';

export const useBeziqueGame = (soundEnabled: boolean = true, onCongratulations?: () => void) => {
  const [gameState, setGameState] = useState<GameState>({
    total: 0,
    brisk: 0,
    history: [],
    lastThreeScores: []
  });
  
  const [isProcessing, setIsProcessing] = useState(false);

  const playSound = useCallback(() => {
    if (!soundEnabled) return;
    
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Resume audio context if it's suspended (required by browsers after user interaction)
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }
      
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
      
      // Clean up
      setTimeout(() => {
        try {
          audioContext.close();
        } catch (e) {
          // Ignore cleanup errors
        }
      }, 300);
    } catch (error) {
      // Fallback: try to use a simple beep if available
      console.warn('Audio context failed, using fallback');
    }
  }, [soundEnabled]);

  const playTadaSound = useCallback(() => {
    if (!soundEnabled) return;
    
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Resume audio context if it's suspended (required by browsers after user interaction)
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }

      // Create a celebratory "ta-da" sound with multiple tones
      const createTone = (frequency: number, startTime: number, duration: number, volume: number = 0.3) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(frequency, startTime);
        
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
      };

      // Ta-da melody: C-E-G-C (triumphant chord progression)
      const now = audioContext.currentTime;
      
      // Main triumphant chord (played simultaneously for richer sound)
      createTone(523, now, 0.6, 0.35);       // C5
      createTone(659, now + 0.05, 0.6, 0.3); // E5 (slightly delayed)
      createTone(784, now + 0.1, 0.6, 0.25); // G5 (more delayed)
      
      // Ascending fanfare
      createTone(1047, now + 0.3, 0.5, 0.4); // C6 (higher octave)
      createTone(1319, now + 0.5, 0.4, 0.3); // E6
      createTone(1568, now + 0.65, 0.4, 0.25); // G6
      
      // Final triumphant note
      createTone(2093, now + 0.8, 0.6, 0.35); // C7 (very high, celebratory)
      
      // Add some "sparkle" with quick high notes
      createTone(2637, now + 1.0, 0.2, 0.2); // E7
      createTone(3136, now + 1.1, 0.2, 0.15); // G7
      
      // Clean up
      setTimeout(() => {
        try {
          audioContext.close();
        } catch (e) {
          // Ignore cleanup errors
        }
      }, 1500);
    } catch (error) {
      // Fallback: play regular sound if ta-da fails
      console.warn('Ta-da sound failed, using fallback');
      playSound();
    }
  }, [soundEnabled, playSound]);

  const playUndoSound = useCallback(() => {
    if (!soundEnabled) return;
    
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Resume audio context if it's suspended (required by browsers after user interaction)
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }

      // Create a "swoosh back" sound for undo (descending frequency)
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.type = 'sawtooth'; // Different waveform for distinct sound
      
      // Descending frequency sweep (going backwards)
      oscillator.frequency.setValueAtTime(900, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.25);
      
      // Quick fade in and out
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.25, audioContext.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.25);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.25);
      
      // Clean up
      setTimeout(() => {
        try {
          audioContext.close();
        } catch (e) {
          // Ignore cleanup errors
        }
      }, 350);
    } catch (error) {
      console.warn('Undo sound failed, using fallback');
    }
  }, [soundEnabled]);

  const playResetSound = useCallback(() => {
    if (!soundEnabled) return;
    
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Resume audio context if it's suspended (required by browsers after user interaction)
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }

      // Create a "whoosh reset" sound (quick sweep down then up)
      const createResetTone = (startFreq: number, endFreq: number, startTime: number, duration: number) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.type = 'triangle'; // Triangle wave for smoother reset sound
        
        oscillator.frequency.setValueAtTime(startFreq, startTime);
        oscillator.frequency.exponentialRampToValueAtTime(endFreq, startTime + duration);
        
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.2, startTime + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
      };

      const now = audioContext.currentTime;
      
      // Two-part reset sound: sweep down then up
      createResetTone(1000, 200, now, 0.15);        // Sweep down (clearing)
      createResetTone(200, 600, now + 0.1, 0.2);    // Sweep up (fresh start)
      
      // Clean up
      setTimeout(() => {
        try {
          audioContext.close();
        } catch (e) {
          // Ignore cleanup errors
        }
      }, 400);
    } catch (error) {
      console.warn('Reset sound failed, using fallback');
    }
  }, [soundEnabled]);

  const addPoints = useCallback((points: number) => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    
    setTimeout(() => {
      setGameState(prev => {
        const newEntry: ScoreEntry = {
          id: `${Date.now()}-${Math.random()}`,
          points,
          timestamp: new Date()
        };
        
        const newTotal = prev.total + points;
        const newHistory = [...prev.history, newEntry];
        const newLastThree = [...prev.lastThreeScores, points].slice(-3);
        
        // Send score update to opponent if we have one
        if (prev.currentOpponent?.playerID) {
          GameServerAPI.sendScoreUpdate(prev.currentOpponent.playerID, newTotal);
        }
        
        // Check if we've reached 10000 points and trigger congratulations with ta-da sound
        if (prev.total < WIN_THRESHOLD && newTotal >= WIN_THRESHOLD && onCongratulations) {
          // Play ta-da sound for reaching 10000 points
          playTadaSound();
          setTimeout(() => onCongratulations(), 100);
        } else {
          // Play regular sound for normal scoring
          playSound();
        }
        
        return {
          ...prev,
          total: newTotal,
          history: newHistory,
          lastThreeScores: newLastThree
        };
      });
      
      setIsProcessing(false);
    }, 300);
  }, [isProcessing, playSound, playTadaSound, onCongratulations]);

  // Add points with metadata (used for brisk entries where we want to mark them)
  const addPointsWithMeta = useCallback((points: number, meta: Partial<ScoreEntry> = {}) => {
    if (isProcessing) return;
    setIsProcessing(true);

    setTimeout(() => {
      setGameState(prev => {
        const newEntry: ScoreEntry = {
          id: `${Date.now()}-${Math.random()}`,
          points,
          timestamp: new Date(),
          ...meta
        } as ScoreEntry;

        const newTotal = prev.total + points;
        const newHistory = [...prev.history, newEntry];
        const newLastThree = [...prev.lastThreeScores, points].slice(-3);

        // Send score update to opponent if we have one
        if (prev.currentOpponent?.playerID) {
          GameServerAPI.sendScoreUpdate(prev.currentOpponent.playerID, newTotal);
        }

        // Play sounds accordingly
        if (prev.total < WIN_THRESHOLD && newTotal >= WIN_THRESHOLD && onCongratulations) {
          playTadaSound();
          setTimeout(() => onCongratulations(), 100);
        } else {
          playSound();
        }

        return {
          ...prev,
          total: newTotal,
          history: newHistory,
          lastThreeScores: newLastThree
        };
      });

      setIsProcessing(false);
    }, 300);
  }, [isProcessing, playSound, playTadaSound, onCongratulations]);

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
            id: h.id || `${Date.now()}-${Math.random()}`,
            points: (h.points as number) || 0,
            timestamp: new Date(h.timestamp),
            isBrisk: h.isBrisk,
            briskValue: h.briskValue,
            source: h.source,
            from: h.from
          })) as ScoreEntry[];

          const restoredLastThree = mappedHistory.slice(-3).map(entry => entry.points);

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
          total: gameState.total,
          opponentID: gameState.currentOpponent?.playerID,
        });
        // Save a local snapshot for quick resume
        try {
          const historySnapshot = gameState.history.map(h => ({ id: h.id, points: h.points, timestamp: h.timestamp.toISOString(), isBrisk: h.isBrisk, briskValue: h.briskValue, source: h.source, from: h.from })) as any;
          saveGameSnapshot({
            history: historySnapshot,
            total: gameState.total,
            opponent: gameState.currentOpponent || null,
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
  }, [gameState.history, gameState.total, gameState.currentOpponent]);

  // Apply points locally without notifying server (used when server instructs the client to apply points)
  const addPointsLocal = useCallback((points: number, meta?: Partial<ScoreEntry>) => {
    let newTotalForSend: number | undefined;
    let opponentToNotify: string | undefined;
    setGameState(prev => {
      const newEntry: ScoreEntry = {
        id: `${Date.now()}-${Math.random()}`,
        points,
        timestamp: new Date(),
        ...(meta || {})
      } as ScoreEntry;
      const newTotal = prev.total + points;
      const newHistory = [...prev.history, newEntry];
      const newLastThree = [...prev.lastThreeScores, points].slice(-3);

      // Capture values to send after state is applied
      newTotalForSend = newTotal;
      opponentToNotify = prev.currentOpponent?.playerID;

      // Play sound for remote-driven scoring
      playSound();

      return {
        ...prev,
        total: newTotal,
        history: newHistory,
        lastThreeScores: newLastThree
      };
    });

    // Notify opponent of our new total
    if (opponentToNotify && typeof newTotalForSend === 'number') {
      setTimeout(() => GameServerAPI.sendScoreUpdate(opponentToNotify!, newTotalForSend!), 0);
    }
  }, [playSound]);

  const undo = useCallback(() => {
    let newTotalForSend: number | undefined;
    let opponentToNotify: string | undefined;
    setGameState(prev => {
      if (prev.history.length === 0) return prev;

      const lastEntry = prev.history[prev.history.length - 1];

      // If the last entry is a brisk (or a remote-applied brisk) and we have an opponent, request opponent to undo as well
      const isBriskLike = !!lastEntry.isBrisk || (lastEntry.source === 'remote' && typeof lastEntry.briskValue === 'number');
      if (isBriskLike && prev.currentOpponent?.playerID) {
        console.log('↩️ undo() detected brisk-like entry, requesting opponent undo', { lastEntry, opponent: prev.currentOpponent.playerID });
        // Ask server to forward an undo request to opponent for the same brisk value
        try {
          GameServerAPI.requestUndoOpponent(prev.currentOpponent.playerID, { points: lastEntry.points, briskValue: lastEntry.briskValue });
        } catch (e) {
          console.warn('Failed to request opponent undo:', e);
        }
      }

      const newHistory = prev.history.slice(0, -1);
      const newTotal = newHistory.reduce((sum, entry) => sum + entry.points, 0);
      const newLastThree = newHistory.slice(-3).map(entry => entry.points);

      // capture values to notify opponent after state update
      newTotalForSend = newTotal;
      opponentToNotify = prev.currentOpponent?.playerID;

      playUndoSound();

      return {
        ...prev,
        total: newTotal,
        history: newHistory,
        lastThreeScores: newLastThree
      };
    });

    if (opponentToNotify && typeof newTotalForSend === 'number') {
      setTimeout(() => GameServerAPI.sendScoreUpdate(opponentToNotify!, newTotalForSend!), 0);
    }
  }, [playUndoSound]);

  // Undo locally without notifying the opponent (used when opponent requested undo)
  const undoLocal = useCallback(() => {
    let newTotalForSend: number | undefined;
    let opponentToNotify: string | undefined;
    setGameState(prev => {
      if (prev.history.length === 0) return prev;

      const newHistory = prev.history.slice(0, -1);
      const newTotal = newHistory.reduce((sum, entry) => sum + entry.points, 0);
      const newLastThree = newHistory.slice(-3).map(entry => entry.points);

      newTotalForSend = newTotal;
      opponentToNotify = prev.currentOpponent?.playerID;

      playUndoSound();

      return {
        ...prev,
        total: newTotal,
        history: newHistory,
        lastThreeScores: newLastThree
      };
    });

    if (opponentToNotify && typeof newTotalForSend === 'number') {
      setTimeout(() => GameServerAPI.sendScoreUpdate(opponentToNotify!, newTotalForSend!), 0);
    }
  }, [playUndoSound]);

  // Undo locally but only if the last entry matches the opponent's undo payload
  const undoLocalMatching = useCallback((payload?: { points?: number; briskValue?: number }) => {
    let newTotalForSend: number | undefined;
    let opponentToNotify: string | undefined;
    setGameState(prev => {
      if (prev.history.length === 0) return prev;

      const lastEntry = prev.history[prev.history.length - 1];

      if (payload && typeof payload.briskValue === 'number') {
        const lastBrisk = (lastEntry as any).briskValue;
        const lastIsBrisk = !!lastEntry.isBrisk || typeof lastBrisk === 'number';
        if (!lastIsBrisk) {
          console.log('Ignoring opponent brisk undo: last entry is not brisk-like', { lastEntry, payload });
          return prev;
        }
      }

      const newHistory = prev.history.slice(0, -1);
      const newTotal = newHistory.reduce((sum, entry) => sum + entry.points, 0);
      const newLastThree = newHistory.slice(-3).map(entry => entry.points);

      newTotalForSend = newTotal;
      opponentToNotify = prev.currentOpponent?.playerID;

      playUndoSound();

      return {
        ...prev,
        total: newTotal,
        history: newHistory,
        lastThreeScores: newLastThree
      };
    });

    if (opponentToNotify && typeof newTotalForSend === 'number') {
      setTimeout(() => GameServerAPI.sendScoreUpdate(opponentToNotify!, newTotalForSend!), 0);
    }
  }, [playUndoSound]);

  const reset = useCallback((skipConfirm: boolean = false) => {
    if (skipConfirm || window.confirm('Are you sure you want to reset the score?')) {
      // Reset only scores/history and keep opponent/connection intact
      resetLocal();

      // If we're connected to an opponent, ask server to forward a reset instruction
      try {
        const opponentID = gameState.currentOpponent?.playerID;
        if (opponentID) {
          GameServerAPI.sendMessage({ type: 'game:reset', payload: { opponentID } });
        }
      } catch (e) {
        // ignore
      }
    }
  }, [playResetSound, gameState.currentOpponent?.playerID]);

  // Reset local score/history only (no server notifications)
  const resetLocal = useCallback(() => {
    let opponentToNotify: string | undefined;
    setGameState(prev => {
      opponentToNotify = prev.currentOpponent?.playerID;
      return {
        ...prev,
        total: 0,
        brisk: 0,
        history: [],
        lastThreeScores: [],
        // Also clear the opponent's displayed score so ahead/behind recalculates to 0
        currentOpponent: prev.currentOpponent ? { ...prev.currentOpponent, score: 0 } : prev.currentOpponent
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

    playResetSound();
  }, [playResetSound]);

  const setBrisk = useCallback((brisk: number) => {
    setGameState(prev => ({ ...prev, brisk }));
  }, []);

  const setCurrentOpponent = useCallback((opponent: Player | undefined) => {
    setGameState(prev => ({ ...prev, currentOpponent: opponent }));
  }, []);

  const updateOpponentScore = useCallback((newScore: number) => {
    setGameState(prev => ({
      ...prev,
      currentOpponent: prev.currentOpponent 
        ? { ...prev.currentOpponent, score: newScore }
        : prev.currentOpponent
    }));
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
    updateOpponentScore
  };
};
