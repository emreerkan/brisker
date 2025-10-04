import React from 'react';
import { X } from 'lucide-react';
import { useLingui } from '@lingui/react/macro';
import type { ModalProps, GameState } from '@/types';
import { ScoreEntryType } from '@/types';
import { useLanguage } from '@/i18n/LanguageContext';
import { ICON_SIZE } from '@/utils/constants';
import styles from '@/components/Brisker.module.css';

interface HistoryModalProps extends ModalProps {
  gameState: GameState;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  gameState
}) => {
  const { t } = useLingui();
  const { formatNumber, formatTime } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>{t`Score History`}</h3>
          <button className={styles.modalClose} onClick={onClose}>
            <X size={ICON_SIZE} />
          </button>
        </div>
        
        <div className={styles.historyContent}>
          <div className={styles.historyTotal}>
            {t`Total Score`}: {formatNumber(gameState.score)}
          </div>
          
          <div className={styles.historyList}>
            {gameState.history.length === 0 ? (
              <div className={styles.historyEmpty}>{t`No scores recorded yet`}</div>
            ) : (
              gameState.history
                .slice()
                .reverse()
                .map((entry, index) => {
                  const displayText = entry.type === ScoreEntryType.BRISK 
                    ? `${formatNumber(entry.value)} (${entry.value / 20} Brisk)`
                    : formatNumber(entry.value);
                  
                  return (
                    <div key={`${entry.timestamp.getTime()}-${index}`} className={styles.historyItem}>
                      <div className={styles.historyPoints}>{displayText}</div>
                      <div className={styles.historyTime}>
                        {formatTime(entry.timestamp)}
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>
        
        <div className={styles.modalFooter}>
          <button className={`${styles.modalButton} ${styles.modalButtonCancel}`} onClick={onClose}>
            {t`Close`}
          </button>
        </div>
      </div>
    </div>
  );
};
