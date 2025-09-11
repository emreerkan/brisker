import { useState, useCallback } from 'react';
import type { ScoreEntry, GameState, Player } from '../types/game';
import { WIN_THRESHOLD } from '../utils/constants';

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

  const undo = useCallback(() => {
    setGameState(prev => {
      if (prev.history.length === 0) return prev;
      
      const newHistory = prev.history.slice(0, -1);
      const newTotal = newHistory.reduce((sum, entry) => sum + entry.points, 0);
      const newLastThree = newHistory.slice(-3).map(entry => entry.points);
      
      return {
        ...prev,
        total: newTotal,
        history: newHistory,
        lastThreeScores: newLastThree
      };
    });
    playUndoSound();
  }, [playUndoSound]);

  const reset = useCallback((skipConfirm: boolean = false) => {
    if (skipConfirm || window.confirm('Are you sure you want to reset the score?')) {
      setGameState({
        total: 0,
        brisk: 0,
        history: [],
        lastThreeScores: []
      });
      playResetSound();
    }
  }, [playResetSound]);

  const setBrisk = useCallback((brisk: number) => {
    setGameState(prev => ({ ...prev, brisk }));
  }, []);

  const setCurrentOpponent = useCallback((opponent: Player | undefined) => {
    setGameState(prev => ({ ...prev, currentOpponent: opponent }));
  }, []);

  return {
    gameState,
    isProcessing,
    addPoints,
    undo,
    reset,
    setBrisk,
    setCurrentOpponent
  };
};
