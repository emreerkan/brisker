import React, { useState, useEffect } from 'react';
import { X, Copy, Share, Search, MapPin, Edit, Save, Check } from 'lucide-react';
import type { ModalProps, Player } from '../../types/game';
import { useLanguage } from '../../i18n/LanguageContext';
import { availableLanguages } from '../../i18n/languages';
import { ICON_SIZE } from '../../utils/constants';
import { getPlayerSettings, updatePlayerSetting } from '../../utils/localStorage';
import { GameServerAPI } from '../../services/gameServer';
import { copyToClipboard, shareContent } from '../../utils/deviceUtils';
import styles from '../BeziqueScoreKeeper.module.css';

interface SettingsModalProps extends ModalProps {
  soundEnabled: boolean;
  onSoundEnabledChange: (enabled: boolean) => void;
  onPlayerSearchOpen: () => void;
  onGeolocationSearchOpen: () => void;
  onPlayWith: (player: Player) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  soundEnabled,
  onSoundEnabledChange,
  onPlayerSearchOpen,
  onGeolocationSearchOpen
}) => {
  const { language, setLanguage, t } = useLanguage();
  const [playerSettings, setPlayerSettings] = useState(getPlayerSettings());
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(playerSettings.name);
  const [copySuccess, setCopySuccess] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  // Update player settings when modal opens
  useEffect(() => {
    if (isOpen) {
      const settings = getPlayerSettings();
      setPlayerSettings(settings);
      setTempName(settings.name);
      
      // Update sound setting if it differs from stored setting
      if (settings.soundEnabled !== soundEnabled) {
        onSoundEnabledChange(settings.soundEnabled);
      }
    }
  }, [isOpen, soundEnabled, onSoundEnabledChange]);

  // Handle sound setting change
  const handleSoundChange = (enabled: boolean) => {
    onSoundEnabledChange(enabled);
    updatePlayerSetting('soundEnabled', enabled);
    setPlayerSettings(prev => ({ ...prev, soundEnabled: enabled }));
  };

  // Handle copy player ID to clipboard
  const handleCopyPlayerID = async () => {
    const success = await copyToClipboard(playerSettings.playerID);
    if (success) {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  // Handle share player ID
  const handleSharePlayerID = async () => {
    const shareData = {
      title: t.shareTitle,
      text: `${t.shareText} ${playerSettings.playerID}`,
      url: window.location.href
    };
    
    const success = await shareContent(shareData);
    if (success) {
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 2000);
    }
  };

  // Handle edit name
  const handleEditName = () => {
    if (isEditingName) {
      // Save name
      if (tempName.trim() && tempName.trim() !== playerSettings.name) {
        updatePlayerSetting('name', tempName.trim());
        setPlayerSettings(prev => ({ ...prev, name: tempName.trim() }));
          // Notify the server so it can notify opponent(s)
          try {
            GameServerAPI.updatePlayerName(tempName.trim());
          } catch (e) {
            console.warn('Failed to notify server of name change', e);
          }
      } else {
        // Reset if empty or unchanged
        setTempName(playerSettings.name);
      }
      setIsEditingName(false);
    } else {
      // Start editing
      setIsEditingName(true);
    }
  };

  const handleNameKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleEditName();
    } else if (e.key === 'Escape') {
      setTempName(playerSettings.name);
      setIsEditingName(false);
    }
  };

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
          {/* Player ID Section */}
          <div className={styles.settingsSection}>
            <h4 className={styles.settingsTitle}>{t.playerIDSectionLabel || t.playerIDSection}</h4>
            <div className={styles.playerIDSection}>
              <div className={`${styles.playerIDDisplay} ${styles.playerIDCentered}`} aria-label={t.yourPlayerIDLabel || 'Your Player ID'}>
                <span className={styles.playerIDText}>{playerSettings.playerID}</span>
              </div>
              
              <div className={styles.playerIDActions}>
                <button
                  className={styles.playerActionButton}
                  onClick={handleCopyPlayerID}
                  title={t.copyTooltip}
                >
                  {copySuccess ? <Check size={18} /> : <Copy size={18} />}
                </button>
                
                <button
                  className={styles.playerActionButton}
                  onClick={handleSharePlayerID}
                  title={t.shareTooltip}
                >
                  {shareSuccess ? <Check size={18} /> : <Share size={18} />}
                </button>
                
                <button
                  className={styles.playerActionButton}
                  onClick={onPlayerSearchOpen}
                  title={t.searchTooltip}
                >
                  <Search size={18} />
                </button>
                
                <button
                  className={styles.playerActionButton}
                  onClick={onGeolocationSearchOpen}
                  title={t.locationTooltip}
                >
                  <MapPin size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Player Name Section */}
          <div className={styles.settingsSection}>
            <h4 className={styles.settingsTitle}>{t.nameLabel || t.playerName}</h4>
            <div className={styles.playerNameSection}>
              {isEditingName ? (
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  onKeyDown={handleNameKeyPress}
                  className={styles.playerNameInput}
                  placeholder={t.enterPlayerName}
                  maxLength={20}
                  autoFocus
                />
              ) : (
                <span className={styles.playerNameDisplay}>{playerSettings.name}</span>
              )}
              
              <button
                className={styles.playerNameEditButton}
                onClick={handleEditName}
                title={isEditingName ? t.saveTooltip : t.editTooltip}
              >
                {isEditingName ? <Save size={18} /> : <Edit size={18} />}
              </button>
            </div>
          </div>

          {/* Language Section */}
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
          
          {/* Audio Section */}
          <div className={styles.settingsSection}>
            <h4 className={styles.settingsTitle}>{t.audioSection}</h4>
            <div className={styles.settingsOption}>
              <span className={styles.settingsLabel}>{t.soundEffects}</span>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={soundEnabled}
                  onChange={(e) => handleSoundChange(e.target.checked)}
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
