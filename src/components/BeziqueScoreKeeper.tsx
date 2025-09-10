import React, { useState, useEffect } from 'react';
import Confetti from 'react-confetti';
import { useBeziqueGame } from '../hooks/useBeziqueGame';
import { useLanguage } from '../i18n/LanguageContext';
import { availableLanguages } from '../i18n/languages';
import styles from './BeziqueScoreKeeper.module.css';
import { Undo2, RotateCcw, Settings, Info, X } from 'lucide-react';

const POINT_VALUES = [20, 40, 50, 60, 80, 100, 150, 200, 250, 300, 400, 500, 600, 800, 1000, 1500];
const ICON_SIZE = 24;

export const BeziqueScoreKeeper: React.FC = () => {
  const [selectedPoint, setSelectedPoint] = useState<number | null>(null);
  const [showBriskSelector, setShowBriskSelector] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });
  
  const { language, setLanguage, t, formatNumber, formatTime } = useLanguage();
  
  const {
    gameState,
    isProcessing,
    addPoints,
    undo,
    reset
  } = useBeziqueGame(soundEnabled, () => setShowCongratulations(true));

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
  }, []);

  const handlePointClick = (points: number) => {
    if (isProcessing) return;
    setSelectedPoint(points);
    addPoints(points);
    setTimeout(() => setSelectedPoint(null), 300);
  };

  const handleBriskClick = () => {
    setShowBriskSelector(true);
  };

  const handleBriskSelect = (brisk: number) => {
    setShowBriskSelector(false);
    // Automatically apply brisk calculation (brisk × 20)
    addPoints(brisk * 20);
  };

  const handleModalClose = () => {
    setShowBriskSelector(false);
  };

  const handleHistoryClick = () => {
    setShowHistory(true);
  };

  const handleHistoryClose = () => {
    setShowHistory(false);
  };

  const handleSettingsClick = () => {
    setShowSettings(true);
  };

  const handleSettingsClose = () => {
    setShowSettings(false);
  };

  const handleInfoClick = () => {
    setShowInfo(true);
  };

  const handleInfoClose = () => {
    setShowInfo(false);
  };

  const handleResetClick = () => {
    setShowResetConfirm(true);
  };

  const handleResetConfirm = () => {
    reset(true); // Skip the built-in confirm dialog
    setShowResetConfirm(false);
  };

  const handleResetCancel = () => {
    setShowResetConfirm(false);
  };

  const handleCongratulationsClose = () => {
    setShowCongratulations(false);
  };

  const handleNewGame = () => {
    reset(true); // Reset the game without confirmation
    setShowCongratulations(false);
  };

  return (
    <div className={styles.container}>
      <div className={`${styles.gridContainer} ${isProcessing ? styles.disabled : ''}`}>
        {/* Row 1: Score (2fr) + Undo (1fr) + History (1fr) */}
        <div
          className={styles.total}
        >
          {formatNumber(gameState.total)}
        </div>
        
        <button
          className={styles.undo}
          onClick={undo}
          disabled={isProcessing || gameState.history.length === 0}
          title={t.undoLastScoreTooltip}
        >
          <Undo2 size={ICON_SIZE} />
        </button>
        
        <button
          className={styles.last}
          onClick={handleHistoryClick}
          disabled={isProcessing}
          title={t.showScoreHistoryTooltip}
        >
          <div className={styles.lastTotalCount}>
            {gameState.history.length}
          </div>
          <div className={styles.lastScoresContainer}>
            {gameState.lastThreeScores.length === 0 ? (
              <div className={styles.lastScoreEmpty}>0</div>
            ) : (
              gameState.lastThreeScores.map((score, index) => (
                <div 
                  key={index} 
                  className={`${styles.lastScoreItem} ${index === gameState.lastThreeScores.length - 1 ? styles.lastScoreLatest : ''}`}
                >
                  {formatNumber(score)}
                </div>
              ))
            )}
          </div>
        </button>

        {/* Row 2-5: Point buttons (4 rows of 4 buttons each) */}
        {POINT_VALUES.map(value => (
          <button
            key={value}
            className={`${styles.point} ${selectedPoint === value ? styles.selected : ''}`}
            onClick={() => handlePointClick(value)}
            disabled={isProcessing}
          >
            {formatNumber(value)}
          </button>
        ))}

        {/* Row 6: Brisk + Info + Reset + Settings */}
        <button
          className={styles.brisk}
          onClick={handleBriskClick}
          disabled={isProcessing}
          title={t.briskDescription}
        >
          {t.brisk}
        </button>
        
        <button
          className={styles.reset}
          onClick={handleResetClick}
          disabled={isProcessing}
          title={t.resetScoreTooltip}
        >
          <RotateCcw size={ICON_SIZE} />
        </button>
        
        <button
          className={styles.settings}
          onClick={handleSettingsClick}
          disabled={isProcessing}
          title={t.settingsTooltip}
        >
          <Settings size={ICON_SIZE} />
        </button>
        
        <button
          className={styles.info}
          onClick={handleInfoClick}
          disabled={isProcessing}
          title={t.appInformationTooltip}
        >
          <Info size={ICON_SIZE} />
        </button>
      </div>

      {isProcessing && <div className={styles.processingOverlay} />}
      
      {showBriskSelector && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>{t.selectBrisk}</h3>
              <button className={styles.modalClose} onClick={handleModalClose}><X size={ICON_SIZE} /></button>
            </div>
            
            <div className={styles.briskGrid}>
              {Array.from({ length: 32 }, (_, i) => i + 1).map(value => (
                <button
                  key={value}
                  className={styles.briskButton}
                  onClick={() => handleBriskSelect(value)}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {showHistory && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>{t.scoreHistory}</h3>
              <button className={styles.modalClose} onClick={handleHistoryClose}><X size={ICON_SIZE} /></button>
            </div>
            
            <div className={styles.historyContent}>
              <div className={styles.historyTotal}>
                {t.totalScore}: {formatNumber(gameState.total)}
              </div>
              
              <div className={styles.historyList}>
                {gameState.history.length === 0 ? (
                  <div className={styles.historyEmpty}>{t.noScoresRecorded}</div>
                ) : (
                  gameState.history
                    .slice()
                    .reverse()
                    .map((entry) => (
                      <div key={entry.id} className={styles.historyItem}>
                        <div className={styles.historyPoints}>{formatNumber(entry.points)}</div>
                        <div className={styles.historyTime}>
                          {formatTime(entry.timestamp)}
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
            
            <div className={styles.modalFooter}>
              <button className={`${styles.modalButton} ${styles.modalButtonCancel}`} onClick={handleHistoryClose}>
                {t.close}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {showSettings && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>{t.settings}</h3>
              <button className={styles.modalClose} onClick={handleSettingsClose}><X size={ICON_SIZE} /></button>
            </div>
            
            <div className={styles.settingsContent}>
              <div className={styles.settingsSection}>
                <h4 className={styles.settingsTitle}>{t.language}</h4>
                <div className={styles.settingsOption}>
                  <span className={styles.settingsLabel}>{t.language}</span>
                  <select
                    className={styles.languageSelect}
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                  >
                    {availableLanguages.map(lang => (
                      <option key={lang.code} value={lang.code}>
                        {lang.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className={styles.settingsSection}>
                <h4 className={styles.settingsTitle}>{t.audioSection}</h4>
                <div className={styles.settingsOption}>
                  <span className={styles.settingsLabel}>{t.soundEffects}</span>
                  <label className={styles.switch}>
                    <input
                      type="checkbox"
                      checked={soundEnabled}
                      onChange={(e) => setSoundEnabled(e.target.checked)}
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>
              </div>
            </div>
            
            <div className={styles.modalFooter}>
              <button className={`${styles.modalButton} ${styles.modalButtonCancel}`} onClick={handleSettingsClose}>
                {t.close}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {showInfo && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>{t.appName}</h3>
              <button className={styles.modalClose} onClick={handleInfoClose}><X size={ICON_SIZE} /></button>
            </div>
            
            <div className={styles.infoContent}>
              <div className={styles.appInfo}>
                <div><strong>{t.appName}</strong></div>
                <div>{t.version} 1.0.0</div>
                <div>{t.description}</div>
                <div>{t.developedBy}</div>
                <div>{t.buildDate}</div>
                
                <div className={styles.featuresSection}>
                  <h4>{t.features}:</h4>
                  <ul className={styles.featuresList}>
                    <li>{t.featureList.scoreTracking}</li>
                    <li>{t.featureList.undoLastScore}</li>
                    <li>{t.featureList.viewHistory}</li>
                    <li>{t.featureList.briskCalculation}</li>
                    <li>{t.featureList.soundEffects}</li>
                    <li>{t.featureList.resetGame}</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className={styles.modalFooter}>
              <button className={`${styles.modalButton} ${styles.modalButtonCancel}`} onClick={handleInfoClose}>
                {t.close}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {showResetConfirm && (
        <div className={styles.confirmOverlay}>
          <div className={styles.confirmDialog}>
            <div className={styles.confirmMessage}>
              {t.resetWarning}
            </div>
            <div className={styles.confirmButtons}>
              <button className={`${styles.confirmButton} ${styles.confirmButtonReset}`} onClick={handleResetConfirm}>
                {t.reset}
              </button>
              <button className={`${styles.confirmButton} ${styles.confirmButtonCancel}`} onClick={handleResetCancel}>
                {t.cancel}
              </button>
            </div>
          </div>
        </div>
      )}

      {showCongratulations && (
        <>
          <div className={styles.congratulationsOverlay}>
            <div className={styles.congratulationsContent}>
              <div className={styles.congratulationsTitle}>
                {t.congratulations}
              </div>
              <div className={styles.congratulationsMessage}>
                {t.congratulationsMessage}
              </div>
              <div className={styles.congratulationsScore}>
                {formatNumber(gameState.total)}
              </div>
              <div className={styles.congratulationsButtons}>
                <button 
                  className={`${styles.congratulationsButton} ${styles.congratulationsButtonNewGame}`}
                  onClick={handleNewGame}
                >
                  {t.newGame}
                </button>
                <button 
                  className={styles.congratulationsButton}
                  onClick={handleCongratulationsClose}
                >
                  {t.close}
                </button>
              </div>
            </div>
          </div>
          <div className={styles.confettiContainer}>
            <Confetti
              width={windowSize.width}
              height={windowSize.height}
              numberOfPieces={500}
              gravity={0.2}
              initialVelocityY={{ min: 10, max: 50 }}
              colors={['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800', '#FF5722']}
              recycle={false}
              run={true}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default BeziqueScoreKeeper;