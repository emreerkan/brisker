import React from 'react';
import Confetti from 'react-confetti';
import { useLingui } from '@lingui/react/macro';
import type { ModalProps, GameState, WindowSize } from '@/types';
import { useLanguage } from '@/i18n/LanguageContext';
import styles from '@/components/Brisker.module.css';

interface CongratulationsModalProps extends ModalProps {
  gameState: GameState;
  windowSize: WindowSize;
  onNewGame: () => void;
}

export const CongratulationsModal: React.FC<CongratulationsModalProps> = ({
  isOpen,
  onClose,
  gameState,
  windowSize,
  onNewGame
}) => {
  const { t } = useLingui();
  const { formatNumber } = useLanguage();

  if (!isOpen) return null;

  return (
    <>
      <div className={styles.congratulationsOverlay}>
        <div className={styles.congratulationsContent}>
          <div className={styles.congratulationsTitle}>
            {t`Congratulations!`}
          </div>
          <div className={styles.congratulationsMessage}>
            {t`You've reached the target score! Fantastic game!`}
          </div>
          <div className={styles.congratulationsScore}>
            {formatNumber(gameState.score)}
          </div>
          <div className={styles.congratulationsButtons}>
            <button 
              className={`${styles.congratulationsButton} ${styles.congratulationsButtonNewGame}`}
              onClick={onNewGame}
            >
              {t`New Game`}
            </button>
            <button 
              className={styles.congratulationsButton}
              onClick={onClose}
            >
              {t`Close`}
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
  );
};
