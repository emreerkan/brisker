import React from 'react';
import { X } from 'lucide-react';
import { useLingui } from '@lingui/react/macro';
import { ICON_SIZE } from '@/utils/constants';
import packageJson from '../../../package.json';
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
            <div>{t`Version`} {packageJson.version}</div>
            <div>{t`Score keeping application for the Bezique card game`}</div>
            <div>{t`Developed by Emre Erkan with Claude Sonnet 4 and GitHub Copilot`}</div>
            <div>{t`Build Date: September 2025`}</div>
            
            <div className={styles.featuresSection}>
              <h4>{t`Features`}:</h4>
              <ul className={styles.featuresList}>
                <li>{t`Digital score tracking with intuitive touch interface`}</li>
                <li>{t`Real-time multiplayer via WebSocket connection`}</li>
                <li>{t`Offline mode for network-free play`}</li>
                <li>{t`Score history and undo moves`}</li>
                <li>{t`Dealer tracking with visual indicators`}</li>
                <li>{t`Progressive Web App - install on any device`}</li>
                <li>{t`Multilingual support`}</li>
                <li>{t`Cross-platform compatibility`}</li>
                <li>{t`Network discovery for nearby players`}</li>
                <li>{t`Persistent storage with auto-save`}</li>
                <li>{t`Brisque calculation`}</li>
                <li>{t`Sound effects`}</li>
              </ul>
            </div>

            <div className={styles.featuresSection}>
              <h4>{t`Translators`}:</h4>
              <ul className={styles.featuresList}>
                <li>{t`English (EN), Turkish (TR)`} - Emre Erkan</li>
                <li>{t`Dutch (NL)`} - Peter Smits</li>
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
