import React from 'react';
import { Undo2 } from 'lucide-react';
import type { GameState } from '@/types';
import { useLanguage } from '@/i18n/LanguageContext';
import { ICON_SIZE } from '@/utils/constants';
import styles from '@/components/Brisker.module.css';

interface ScoreDisplayProps {
  gameState: GameState;
  isProcessing: boolean;
  onUndo: () => void;
  onHistoryClick: () => void;
  getLastThreeScores: () => number[];
}

export const ScoreDisplay: React.FC<ScoreDisplayProps> = ({
  gameState,
  isProcessing,
  onUndo,
  onHistoryClick,
  getLastThreeScores
}) => {
  const { t, formatNumber } = useLanguage();
  const lastThreeScores = getLastThreeScores();

  return (
    <>
      {/* Row 1: Score (2fr) + Undo (1fr) + History (1fr) */}
      <div className={styles.total}>
        {formatNumber(gameState.score)}
        {gameState.isDealer && (
          <span className={styles.dealerIndicator}>D</span>
        )}
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
          {lastThreeScores.length === 0 ? (
            <div className={styles.lastScoreEmpty}>0</div>
          ) : (
            lastThreeScores.map((score: number, index: number) => (
              <div 
                key={index} 
                className={`${styles.lastScoreItem} ${index === lastThreeScores.length - 1 ? styles.lastScoreLatest : ''}`}
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
