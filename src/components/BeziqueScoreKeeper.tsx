import React, { useState, useEffect } from 'react';
import { useBeziqueGame } from '../hooks/useBeziqueGame';
import { useWindowSize } from '../hooks/useWindowSize';
import { useLanguage } from '../i18n/LanguageContext';
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
  CongratulationsModal,
  PlayerSearchModal,
  GeolocationSearchModal
} from './modals';

import { getPlayerSettings } from '../utils/localStorage';
import type { Player } from '../types/game';
import styles from './BeziqueScoreKeeper.module.css';

export const BeziqueScoreKeeper: React.FC = () => {
  // Initialize sound settings from localStorage
  const [soundEnabled, setSoundEnabled] = useState(() => getPlayerSettings().soundEnabled);
  
  // Language hook
  const { t, formatNumber } = useLanguage();
  
  // UI State
  const [selectedPoint, setSelectedPoint] = useState<number | null>(null);
  
  // Modal States
  const [showBriskSelector, setShowBriskSelector] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [showPlayerSearch, setShowPlayerSearch] = useState(false);
  const [showGeolocationSearch, setShowGeolocationSearch] = useState(false);
  
  // Hooks
  const windowSize = useWindowSize();
  
  const {
    gameState,
    isProcessing,
    addPoints,
    undo,
    reset,
    setCurrentOpponent
  } = useBeziqueGame(soundEnabled, () => setShowCongratulations(true));  // Development keyboard shortcut for testing
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

  const handlePlayerSearchOpen = () => {
    setShowSettings(false);
    setShowPlayerSearch(true);
  };

  const handleGeolocationSearchOpen = () => {
    setShowSettings(false);
    setShowGeolocationSearch(true);
  };

  const handlePlayerSearchClose = () => {
    setShowPlayerSearch(false);
    setShowSettings(true);
  };

  const handleGeolocationSearchClose = () => {
    setShowGeolocationSearch(false);
    setShowSettings(true);
  };

  const handlePlayWith = (player: Player) => {
    // Set the current opponent with initial score of 0
    setCurrentOpponent({ ...player, score: 0 });
    
    // Close all modals and return to main screen
    setShowPlayerSearch(false);
    setShowGeolocationSearch(false);
    setShowSettings(false);
    
    console.log('Playing with:', player);
    alert(`${t.startingGameWith} ${player.name} (ID: ${player.playerID})`);
  };

  // Calculate point difference for opponent display
  const getOpponentStatusText = () => {
    if (!gameState.currentOpponent) return '';
    
    const playerScore = gameState.total;
    const opponentScore = gameState.currentOpponent.score || 0;
    const difference = playerScore - opponentScore;
    
    if (difference > 0) {
      return `${formatNumber(difference)} ${t.ahead}`;
    } else if (difference < 0) {
      return `${formatNumber(Math.abs(difference))} ${t.behind}`;
    } else {
      return t.tied;
    }
  };

  return (
    <div className={styles.container}>
      <div className={`${styles.gridContainer} ${gameState.currentOpponent ? styles.withOpponent : ''} ${isProcessing ? styles.disabled : ''}`}>
        {gameState.currentOpponent && (
          <div className={styles.opponentBar}>
            <div className={styles.opponentName}>
              {t.opponent}: {gameState.currentOpponent.name}
            </div>
            <div className={styles.opponentStatus}>
              {getOpponentStatusText()}
            </div>
          </div>
        )}
        
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
        onPlayerSearchOpen={handlePlayerSearchOpen}
        onGeolocationSearchOpen={handleGeolocationSearchOpen}
        onPlayWith={handlePlayWith}
      />
      
      <PlayerSearchModal
        isOpen={showPlayerSearch}
        onClose={handlePlayerSearchClose}
        onPlayWith={handlePlayWith}
      />
      
      <GeolocationSearchModal
        isOpen={showGeolocationSearch}
        onClose={handleGeolocationSearchClose}
        onPlayWith={handlePlayWith}
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