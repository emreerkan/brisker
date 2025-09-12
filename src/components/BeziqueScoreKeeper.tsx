import React, { useState, useEffect } from 'react';
import { useBeziqueGame } from '@/hooks/useBeziqueGame';
import { useWindowSize } from '@/hooks/useWindowSize';
import { useLanguage } from '@/i18n/LanguageContext';
import { BRISK_MULTIPLIER } from '@/utils/constants';

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

import { getPlayerSettings, clearGameSnapshot } from '@/utils/localStorage';
import { GameServerAPI } from '@/services/gameServer';
import type { Player } from '@/types';
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
  
  // WebSocket connection status
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  
  // Hooks
  const windowSize = useWindowSize();
  
  const {
    gameState,
    isProcessing,
    addPoints,
    addPointsWithMeta,
    addPointsLocal,
    undo,
    undoLocal,
    undoLocalMatching,
    reset,
    resetLocal,
    setCurrentOpponent,
    updateOpponentScore,
    getLastThreeScores,
    opponent
  } = useBeziqueGame(soundEnabled, () => setShowCongratulations(true));  // Development keyboard shortcut for testing
  useEffect(() => {
    const handleTriggerCongratulations = () => {
      addPoints(10000);
    };

    window.addEventListener('triggerCongratulations', handleTriggerCongratulations);
    return () => window.removeEventListener('triggerCongratulations', handleTriggerCongratulations);
  }, [addPoints]);

  // Test WebSocket connection on component mount
  useEffect(() => {
    const testWebSocket = async () => {
      try {
        console.log('🚀 Testing WebSocket connection...');
        setConnectionStatus('connecting');
        
        const playerID = await GameServerAPI.connectWebSocket();
        console.log('✅ WebSocket connected! Player ID:', playerID);
        
        setConnectionStatus('connected');
        
        // Test requesting all players
        GameServerAPI.requestAllPlayers();
        console.log('📡 Requested all players from server');
      } catch (error) {
        console.error('❌ WebSocket connection failed:', error);
        setConnectionStatus('disconnected');
      }
    };

    testWebSocket();
  }, []);

  // Register game-related WebSocket event handlers once on mount so both
  // the player who initiates the game and the opponent receive notifications.
  useEffect(() => {
    const onAutoJoined = (payload: any) => {
      console.log('Game auto-joined (global handler):', payload);
      // Update opponent in game state; UI changes are sufficient feedback
      setCurrentOpponent({
        playerID: payload.opponentID,
        name: payload.opponentName,
        isOnline: true
      });
    };

    const onResume = (payload: any) => {
      console.log('Game resume requested:', payload);
      // payload: { opponentID, opponentName, gameState }
      // If server provided a gameState, prefer using its data for opponent score so ahead/behind recalculates
      if (payload.gameState && typeof payload.gameState.total === 'number') {
        // payload.gameState is likely the opponent's snapshot (their total and history)
        setCurrentOpponent({ playerID: payload.opponentID, name: payload.opponentName, isOnline: true, score: payload.gameState.total });
        updateOpponentScore(payload.gameState.total);
      } else {
        setCurrentOpponent({ playerID: payload.opponentID, name: payload.opponentName, isOnline: true });
      }
      if (payload.gameState) {
        console.log('Restored game state from server (not merged automatically):', payload.gameState);
      }
    };

    const onOpponentScored = (payload: any) => {
      console.log('Opponent scored (global handler):', payload);
      updateOpponentScore(payload.score);
    };

    const onApplyPoints = (payload: any) => {
      console.log('Apply points instruction received:', payload);
      // payload: { points, from, briskValue }
      // Apply the points locally (do not re-broadcast)
      // Determine if this is a brisk entry based on briskValue presence
      const isBrisk = typeof payload.briskValue === 'number';
      addPointsLocal(payload.points, isBrisk);
    };

    const onOpponentUndo = (payload: any) => {
      console.log('Opponent requested undo:', payload);
      // Attempt guarded undo that only removes the last entry if it matches the opponent's undo payload
      try {
        undoLocalMatching(payload);
      } catch (e) {
        console.warn('Guarded undo failed, falling back to local undo', e);
        undoLocal();
      }
    };

    const onRemoteReset = (payload: any) => {
      console.log('Received remote reset instruction:', payload);
      // Clear local snapshot so reload won't restore previous scores
      try { clearGameSnapshot(); } catch (e) { /* ignore */ }
      resetLocal();
    };

    const onPlayerNameChanged = (payload: any) => {
      console.log('Player name changed event received:', payload);
      const pid = payload && payload.playerID;
      const name = payload && payload.name;
      if (!pid) return;
      // If the changed player is our current opponent, update the opponent bar
      if (opponent && pid === opponent.playerID) {
        setCurrentOpponent({ playerID: pid, name: name || opponent.name || '', isOnline: true, score: opponent.score });
        return;
      }
      // If we don't yet have a currentOpponent, ignore; when we need players we'll request the list explicitly.
    };

    // Connection lifecycle handlers to keep UI indicator accurate
    const onConnectionEstablished = () => {
      setConnectionStatus('connecting');
    };

    const onPlayerIdAssigned = () => {
      // We have an ID and are effectively connected
      setConnectionStatus('connected');
    };

    const onPlayerReconnected = () => {
      setConnectionStatus('connected');
    };

    const onPlayerOffline = () => {
      setConnectionStatus('disconnected');
    };

    GameServerAPI.addEventListener('game:auto_joined', onAutoJoined);
    GameServerAPI.addEventListener('game:opponent_scored', onOpponentScored);
    GameServerAPI.addEventListener('game:apply_points', onApplyPoints);
    GameServerAPI.addEventListener('game:opponent_undo', onOpponentUndo);
    GameServerAPI.addEventListener('game:reset', onRemoteReset);
    GameServerAPI.addEventListener('game:resume', onResume);
    GameServerAPI.addEventListener('player:name_changed', onPlayerNameChanged);
    GameServerAPI.addEventListener('connection:established', onConnectionEstablished);
    GameServerAPI.addEventListener('player:id_assigned', onPlayerIdAssigned);
    GameServerAPI.addEventListener('player:reconnected', onPlayerReconnected);
    GameServerAPI.addEventListener('player:offline', onPlayerOffline);

    return () => {
      GameServerAPI.removeEventListener('game:auto_joined', onAutoJoined);
      GameServerAPI.removeEventListener('game:opponent_scored', onOpponentScored);
      GameServerAPI.removeEventListener('game:apply_points', onApplyPoints);
      GameServerAPI.removeEventListener('game:opponent_undo', onOpponentUndo);
      GameServerAPI.removeEventListener('game:reset', onRemoteReset);
      GameServerAPI.removeEventListener('game:resume', onResume);
      GameServerAPI.removeEventListener('player:name_changed', onPlayerNameChanged);
      GameServerAPI.removeEventListener('connection:established', onConnectionEstablished);
      GameServerAPI.removeEventListener('player:id_assigned', onPlayerIdAssigned);
      GameServerAPI.removeEventListener('player:reconnected', onPlayerReconnected);
      GameServerAPI.removeEventListener('player:offline', onPlayerOffline);
    };
  }, [setCurrentOpponent, updateOpponentScore, opponent?.playerID]);

  // Event Handlers
  const handlePointClick = (points: number) => {
    if (isProcessing) return;
    setSelectedPoint(points);
    addPoints(points);
    setTimeout(() => setSelectedPoint(null), 300);
  };

  const handleBriskSelect = (brisk: number) => {
    setShowBriskSelector(false);
    const pointsForPlayer = brisk * BRISK_MULTIPLIER;
    // Mark this entry as brisk so undo can be coordinated
    addPointsWithMeta(pointsForPlayer);

    // If playing with an opponent, automatically add the remaining brisk to them
    if (opponent && opponent.playerID) {
      const remainingBrisk = Math.max(0, (32 - brisk));
      const pointsForOpponent = remainingBrisk * BRISK_MULTIPLIER;
      // Send apply_points instruction to opponent so their client updates locally
      GameServerAPI.applyPointsToOpponent(opponent.playerID, pointsForOpponent, { isBrisk: true, briskValue: remainingBrisk });
    }
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

  const handlePlayWith = async (player: Player) => {
    try {
      // Get current player settings
      const currentPlayerSettings = getPlayerSettings();
      
      // Connect to WebSocket and get assigned playerID
      await GameServerAPI.connectWebSocket();
      
      // Update player name with server
      GameServerAPI.updatePlayerName(currentPlayerSettings.name);
      
      // Event listeners for game events are registered globally on mount
      
      // Start game with selected opponent
      GameServerAPI.startGameWith(player.playerID);
      
      // Close all modals and return to main screen
      setShowPlayerSearch(false);
      setShowGeolocationSearch(false);
      setShowSettings(false);
      
      console.log('Game request sent to:', player.name);
      
    } catch (error) {
  console.error('Failed to start game with player:', error);
  // Keep errors in console; UI state changes already communicate failures
    }
  };

  // Calculate point difference for opponent display
  const getOpponentStatusText = () => {
    if (!opponent) return '';
    
    const playerScore = gameState.score;
    const opponentScore = gameState.opponentScore || 0;
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
      <div className={`${styles.gridContainer} ${opponent ? styles.withOpponent : ''} ${isProcessing ? styles.disabled : ''}`}>
        {/* Connection Status - Simple circle indicator */}
        <div
          className={styles.connectionIndicator}
          style={{ backgroundColor: connectionStatus === 'connected' ? '#4CAF50' : '#F44336' }}
        />
        
        {opponent && (
          <div className={styles.opponentBar}>
            <div className={styles.opponentName}>
              {t.opponent}: {opponent.name}
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
          getLastThreeScores={getLastThreeScores}
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