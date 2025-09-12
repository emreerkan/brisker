import React from 'react';
import { X } from 'lucide-react';
import type { ModalProps } from '@/types';
import { useLanguage } from '@/i18n/LanguageContext';
import { ICON_SIZE } from '@/utils/constants';
import styles from '@/components/Brisker.module.css';

export const InfoModal: React.FC<ModalProps> = ({
  isOpen,
  onClose
}) => {
  const { t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>{t.appName}</h3>
          <button className={styles.modalClose} onClick={onClose}>
            <X size={ICON_SIZE} />
          </button>
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
          <button className={`${styles.modalButton} ${styles.modalButtonCancel}`} onClick={onClose}>
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
