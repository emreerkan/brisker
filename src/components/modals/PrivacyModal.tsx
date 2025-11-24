import React from 'react';
import { X } from 'lucide-react';
import { t } from '@lingui/macro';
import { ICON_SIZE } from '@/utils/constants';
import styles from '@/components/Brisker.module.css';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>{t`Privacy & Data`}</h3>
          <button className={styles.modalClose} onClick={onClose}>
            <X size={ICON_SIZE} />
          </button>
        </div>
        
        <div className={styles.infoContent}>
          <div className={styles.appInfo}>
            <h4>{t`What Is Tracked`}</h4>
            <p style={{ marginBottom: '12px', lineHeight: '1.5' }}>
              {t`Google Analytics is used to understand how the app is used and improve the experience. The following data is tracked:`}
            </p>
            <ul className={styles.featuresList}>
              <li>{t`Number of users`}</li>
              <li>{t`Multiplayer games played`}</li>
              <li>{t`Games completed`}</li>
            </ul>

            <h4 style={{ marginTop: '20px' }}>{t`Why Tracking Is Used`}</h4>
            <p style={{ marginBottom: '12px', lineHeight: '1.5' }}>
              {t`This data helps improve Brisker by understanding how it is used.`}
            </p>

            <h4 style={{ marginTop: '20px' }}>{t`Your Control`}</h4>
            <p style={{ marginBottom: '12px', lineHeight: '1.5' }}>
              {t`Tracking can be accepted or rejected at any time. No tracking occurs if rejected.`}
            </p>

            <h4 style={{ marginTop: '20px' }}>{t`Google's Privacy Policy`}</h4>
            <p style={{ marginBottom: '12px', lineHeight: '1.5' }}>
              <a 
                href="https://policies.google.com/privacy" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ color: '#2563eb', textDecoration: 'underline' }}
              >
                {t`View Google Analytics Privacy Policy`}
              </a>
            </p>
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
