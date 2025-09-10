import React from 'react';
import { Undo2 } from 'lucide-react';
import type { GameState } from '../../types/game';
import { useLanguage } from '../../i18n/LanguageContext';
import { ICON_SIZE } from '../../utils/constants';
import styles from '../BeziqueScoreKeeper.module.css';

interface ScoreDisplayProps {
  gameState: GameState;
  isProcessing: boolean;
  onUndo: () => void;
  onHistoryClick: () => void;
}

export const ScoreDisplay: React.FC<ScoreDisplayProps> = ({
  gameState,
  isProcessing,
  onUndo,
  onHistoryClick
}) => {
  const { t, formatNumber } = useLanguage();

  return (
    <>
      {/* Row 1: Score (2fr) + Undo (1fr) + History (1fr) */}
      <div className={styles.total}>
        {formatNumber(gameState.total)}
      </div>
      
      <button
        className={styles.undo}
        onClick={onUndo}
        disabled={isProcessing || gameState.history.length === 0}
        title={t.undoLastScoreTooltip}
      >
        <Undo2 size={ICON_SIZE} />
      </button>
      
      <button
        className={styles.last}
        onClick={onHistoryClick}
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
    </>
  );
};
