import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useBeziqueGame } from '@/hooks/useBeziqueGame';
import { useWindowSize } from '@/hooks/useWindowSize';
import { useLanguage } from '@/i18n/LanguageContext';
import { BRISK_MULTIPLIER, DEFAULT_WIN_THRESHOLD } from '@/utils/constants';

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
import { ScoreEntryType } from '@/types';
import styles from './Brisker.module.css';

export const Brisker: React.FC = () => {
  // Initialize sound settings and win threshold preferences from localStorage
  const initialSettingsRef = useRef(getPlayerSettings());
  const [soundEnabled, setSoundEnabled] = useState(initialSettingsRef.current.soundEnabled);
  const [winThresholdSetting, setWinThresholdSetting] = useState(
    initialSettingsRef.current.winThreshold ?? DEFAULT_WIN_THRESHOLD
  );
  const inviteLinkHandled = useRef(false);
  
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

  const closeAllModals = useCallback(() => {
    setShowBriskSelector(false);
    setShowHistory(false);
    setShowSettings(false);
    setShowInfo(false);
    setShowResetConfirm(false);
    setShowCongratulations(false);
    setShowPlayerSearch(false);
    setShowGeolocationSearch(false);
  }, []);
  
  // WebSocket connection status
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  
  // Hooks
  const windowSize = useWindowSize();
  
  const {
    gameState,
    isProcessing,
    addPoints,
    undo,
    reset,
    setCurrentOpponent,
    updateOpponentScore,
    getLastThreeScores,
    opponent,
    winThreshold: sessionWinThreshold,
    setWinThreshold: setSessionWinThreshold
  } = useBeziqueGame(soundEnabled, () => setShowCongratulations(true), winThresholdSetting);
  useEffect(() => {
    const handleTriggerCongratulations = () => {
      const remaining = Math.max(sessionWinThreshold - gameState.score, 0);
      if (remaining > 0) {
        addPoints(remaining);
      }
    };

    window.addEventListener('triggerCongratulations', handleTriggerCongratulations);
    return () => window.removeEventListener('triggerCongratulations', handleTriggerCongratulations);
  }, [addPoints, gameState.score, sessionWinThreshold]);

  useEffect(() => {
    if (!opponent) {
      setSessionWinThreshold(winThresholdSetting);
    }
  }, [opponent, setSessionWinThreshold, winThresholdSetting]);

  useEffect(() => {
    if (inviteLinkHandled.current) return;
    const params = new URLSearchParams(window.location.search);
    const pidParam = params.get('pid');
    if (!pidParam || !/^\d{4,12}$/.test(pidParam)) {
      return;
    }

    inviteLinkHandled.current = true;

    (async () => {
      try {
        const currentID = await GameServerAPI.connectWithRetry();
        if (pidParam === currentID) {
          return;
        }
        GameServerAPI.requestGameWithHost(pidParam);
      } catch (error) {
        console.warn('Failed to process invite link:', error);
      } finally {
        try {
          const url = new URL(window.location.href);
          url.searchParams.delete('pid');
          const queryString = url.searchParams.toString();
          const newUrl = `${url.pathname}${queryString ? `?${queryString}` : ''}${url.hash}`;
          window.history.replaceState({}, document.title, newUrl);
        } catch (e) {
          // ignore history errors
        }
      }
    })();
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
      if (typeof payload.winThreshold === 'number' && Number.isFinite(payload.winThreshold)) {
        setSessionWinThreshold(Math.max(100, Math.round(payload.winThreshold)));
      }
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
      const resumeThreshold = payload?.gameState?.winThreshold ?? payload?.winThreshold;
      if (typeof resumeThreshold === 'number' && Number.isFinite(resumeThreshold)) {
        setSessionWinThreshold(Math.max(100, Math.round(resumeThreshold)));
      }
      if (payload.gameState) {
        console.log('Restored game state from server (not merged automatically):', payload.gameState);
      }
    };

    const onOpponentScored = (payload: any) => {
      console.log('Opponent scored (global handler):', payload);
      updateOpponentScore(payload.score);
    };

    const onApplyBrisks = (payload: any) => {
      console.log('Apply brisks instruction received:', payload);
      // payload: { briskCount }
      // Calculate points and add as brisk type
      const points = payload.briskCount * BRISK_MULTIPLIER;
      addPoints(points, ScoreEntryType.BRISK, true); // isRemote = true
    };

    const onOpponentUndo = (payload: any) => {
      console.log('Opponent requested undo:', payload);
      // Use consolidated undo with payload and isRemote flag
      undo(payload, true); // isRemote = true
    };

    const onRemoteReset = (payload: any) => {
      console.log('Received remote reset instruction:', payload);
      // Clear local snapshot so reload won't restore previous scores
      try { clearGameSnapshot(); } catch (e) { /* ignore */ }
      closeAllModals();
      reset(true, true); // skipConfirm = true, isRemote = true
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
    GameServerAPI.addEventListener('game:apply_brisks', onApplyBrisks);
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
      GameServerAPI.removeEventListener('game:apply_brisks', onApplyBrisks);
      GameServerAPI.removeEventListener('game:opponent_undo', onOpponentUndo);
      GameServerAPI.removeEventListener('game:reset', onRemoteReset);
      GameServerAPI.removeEventListener('game:resume', onResume);
      GameServerAPI.removeEventListener('player:name_changed', onPlayerNameChanged);
      GameServerAPI.removeEventListener('connection:established', onConnectionEstablished);
      GameServerAPI.removeEventListener('player:id_assigned', onPlayerIdAssigned);
      GameServerAPI.removeEventListener('player:reconnected', onPlayerReconnected);
      GameServerAPI.removeEventListener('player:offline', onPlayerOffline);
    };
  }, [setCurrentOpponent, updateOpponentScore, opponent?.playerID, setSessionWinThreshold, closeAllModals]);

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
    addPoints(pointsForPlayer, ScoreEntryType.BRISK);

    // If playing with an opponent, automatically add the remaining brisk to them
    if (opponent && opponent.playerID) {
      const remainingBrisk = Math.max(0, (32 - brisk));
      // Send apply_brisks instruction to opponent so their client adds brisk locally
      GameServerAPI.applyBrisksToOpponent(opponent.playerID, remainingBrisk);
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
      const targetScore = currentPlayerSettings.winThreshold ?? winThresholdSetting ?? DEFAULT_WIN_THRESHOLD;
      setSessionWinThreshold(targetScore);
      GameServerAPI.startGameWith(player.playerID, targetScore);
      
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
              {gameState.opponentIsDealer && (
                <span className={styles.opponentDealerIndicator}>D</span>
              )}
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
        winThreshold={winThresholdSetting}
        onWinThresholdChange={(threshold) => {
          setWinThresholdSetting(threshold);
          if (!opponent) {
            setSessionWinThreshold(threshold);
          }
        }}
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

export default Brisker;
