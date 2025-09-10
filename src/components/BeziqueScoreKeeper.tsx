import React, { useState, useEffect } from 'react';
import { useBeziqueGame } from '../hooks/useBeziqueGame';
import { useWindowSize } from '../hooks/useWindowSize';
import { BRISK_MULTIPLIER } from '../utils/constants';

// UI Components
import { ScoreDisplay, PointButtons, ActionButtons } from './ui';

// Modal Components
import {
  BriskSelector,
  HistoryModal,
  SettingsModal,
  InfoModal,
  ResetConfirmDialog,
  CongratulationsModal
} from './modals';

import styles from './BeziqueScoreKeeper.module.css';

export const BeziqueScoreKeeper: React.FC = () => {
  // UI State
  const [selectedPoint, setSelectedPoint] = useState<number | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  // Modal States
  const [showBriskSelector, setShowBriskSelector] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showCongratulations, setShowCongratulations] = useState(false);
  
  // Hooks
  const windowSize = useWindowSize();
  
  const {
    gameState,
    isProcessing,
    addPoints,
    undo,
    reset
  } = useBeziqueGame(soundEnabled, () => setShowCongratulations(true));

  // Development keyboard shortcut for testing
  useEffect(() => {
    const handleTriggerCongratulations = () => {
      addPoints(10000);
    };

    window.addEventListener('triggerCongratulations', handleTriggerCongratulations);
    return () => window.removeEventListener('triggerCongratulations', handleTriggerCongratulations);
  }, [addPoints]);

  // Event Handlers
  const handlePointClick = (points: number) => {
    if (isProcessing) return;
    setSelectedPoint(points);
    addPoints(points);
    setTimeout(() => setSelectedPoint(null), 300);
  };

  const handleBriskSelect = (brisk: number) => {
    setShowBriskSelector(false);
    addPoints(brisk * BRISK_MULTIPLIER);
  };

  const handleResetConfirm = () => {
    reset(true);
    setShowResetConfirm(false);
  };

  const handleNewGame = () => {
    reset(true);
    setShowCongratulations(false);
  };

  return (
    <div className={styles.container}>
      <div className={`${styles.gridContainer} ${isProcessing ? styles.disabled : ''}`}>
        <ScoreDisplay
          gameState={gameState}
          isProcessing={isProcessing}
          onUndo={undo}
          onHistoryClick={() => setShowHistory(true)}
        />
        
        <PointButtons
          selectedPoint={selectedPoint}
          isProcessing={isProcessing}
          onPointClick={handlePointClick}
        />
        
        <ActionButtons
          isProcessing={isProcessing}
          onBriskClick={() => setShowBriskSelector(true)}
          onResetClick={() => setShowResetConfirm(true)}
          onSettingsClick={() => setShowSettings(true)}
          onInfoClick={() => setShowInfo(true)}
        />
      </div>

      {isProcessing && <div className={styles.processingOverlay} />}
      
      {/* Modals */}
      <BriskSelector
        isOpen={showBriskSelector}
        onClose={() => setShowBriskSelector(false)}
        onBriskSelect={handleBriskSelect}
      />
      
      <HistoryModal
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        gameState={gameState}
      />
      
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        soundEnabled={soundEnabled}
        onSoundEnabledChange={setSoundEnabled}
      />
      
      <InfoModal
        isOpen={showInfo}
        onClose={() => setShowInfo(false)}
      />
      
      <ResetConfirmDialog
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={handleResetConfirm}
      />
      
      <CongratulationsModal
        isOpen={showCongratulations}
        onClose={() => setShowCongratulations(false)}
        gameState={gameState}
        windowSize={windowSize}
        onNewGame={handleNewGame}
      />
    </div>
  );
};

export default BeziqueScoreKeeper;