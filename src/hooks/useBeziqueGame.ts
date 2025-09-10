import { useState, useCallback } from 'react';
import type { ScoreEntry, GameState } from '../types/game';
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

  const addPoints = useCallback((points: number) => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    playSound();
    
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
        
        // Check if we've reached 10000 points and trigger congratulations
        if (prev.total < WIN_THRESHOLD && newTotal >= WIN_THRESHOLD && onCongratulations) {
          setTimeout(() => onCongratulations(), 100);
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
  }, [isProcessing, playSound, onCongratulations]);

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
    playSound();
  }, [playSound]);

  const reset = useCallback((skipConfirm: boolean = false) => {
    if (skipConfirm || window.confirm('Are you sure you want to reset the score?')) {
      setGameState({
        total: 0,
        brisk: 0,
        history: [],
        lastThreeScores: []
      });
      playSound();
    }
  }, [playSound]);

  const setBrisk = useCallback((brisk: number) => {
    setGameState(prev => ({ ...prev, brisk }));
  }, []);

  return {
    gameState,
    isProcessing,
    addPoints,
    undo,
    reset,
    setBrisk
  };
};
