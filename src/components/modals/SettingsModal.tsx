import React from 'react';
import { X } from 'lucide-react';
import type { ModalProps } from '../../types/game';
import { useLanguage } from '../../i18n/LanguageContext';
import { availableLanguages } from '../../i18n/languages';
import { ICON_SIZE } from '../../utils/constants';
import styles from '../BeziqueScoreKeeper.module.css';

interface SettingsModalProps extends ModalProps {
  soundEnabled: boolean;
  onSoundEnabledChange: (enabled: boolean) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  soundEnabled,
  onSoundEnabledChange
}) => {
  const { language, setLanguage, t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>{t.settings}</h3>
          <button className={styles.modalClose} onClick={onClose}>
            <X size={ICON_SIZE} />
          </button>
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
                  onChange={(e) => onSoundEnabledChange(e.target.checked)}
                />
                <span className={styles.slider}></span>
              </label>
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
