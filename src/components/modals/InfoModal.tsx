import React from 'react';
import { X } from 'lucide-react';
import { useLingui } from '@lingui/react/macro';
import { ICON_SIZE } from '@/utils/constants';
import styles from '@/components/Brisker.module.css';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose }) => {
  const { t } = useLingui();

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>{t`Brisker`}</h3>
          <button className={styles.modalClose} onClick={onClose}>
            <X size={ICON_SIZE} />
          </button>
        </div>
        
        <div className={styles.infoContent}>
          <div className={styles.appInfo}>
            <div><strong>{t`Brisker`}</strong></div>
            <div>{t`Version`} 1.0.0</div>
            <div>{t`Score keeping application for the Bezique card game`}</div>
            <div>{t`Developed by Emre Erkan with Claude Sonnet 4 and GitHub Copilot`}</div>
            <div>{t`Build Date: September 2025`}</div>
            
            <div className={styles.featuresSection}>
              <h4>{t`Features`}:</h4>
              <ul className={styles.featuresList}>
                <li>{t`Score tracking and addition`}</li>
                <li>{t`Undo last score`}</li>
                <li>{t`View score history`}</li>
                <li>{t`Brisk calculation (brisk x 20)`}</li>
                <li>{t`Sound effects`}</li>
                <li>{t`Reset game`}</li>
              </ul>
            </div>
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
