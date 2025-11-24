import React, { useState, useEffect } from 'react';
import { X, Copy, Share, Search, MapPin, Edit, Save, Check, Shield } from 'lucide-react';
import { Trans, useLingui } from '@lingui/react/macro';
import type { ModalProps, Player, BeziqueVariantId } from '@/types';
import type { ToastType } from '@/components/ui/Toast';
import { useLanguage } from '@/i18n/LanguageContext';
import { availableLanguages } from '@/i18n/config';
import { ICON_SIZE } from '@/utils/constants';
import { getPlayerSettings, updatePlayerSetting } from '@/utils/localStorage';
import { GameServerAPI } from '@/services/gameServer';
import { copyToClipboard, shareContent } from '@/utils/deviceUtils';
import { getConsentStatus, setConsent } from '@/utils/consent';
import styles from '@/components/Brisker.module.css';
import { DEFAULT_VARIANT, isSupportedVariant } from '@/config/variants';

interface SettingsModalProps extends ModalProps {
  soundEnabled: boolean;
  onSoundEnabledChange: (enabled: boolean) => void;
  onPlayerSearchOpen: () => void;
  onGeolocationSearchOpen: () => void;
  onPlayWith: (player: Player) => void;
  winThreshold: number;
  onWinThresholdChange: (threshold: number) => void;
  onVariantChange: (variant: BeziqueVariantId) => void;
  isOpponentConnected: boolean;
  onPrivacyOpen: () => void;
  showToast: (message: string, type: ToastType, duration?: number) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  soundEnabled,
  onSoundEnabledChange,
  onPlayerSearchOpen,
  onGeolocationSearchOpen,
  winThreshold,
  onWinThresholdChange,
  onVariantChange,
  isOpponentConnected,
  onPrivacyOpen,
  showToast
}) => {
  const { t } = useLingui();
  const { language, setLanguage, formatNumber } = useLanguage();
  const [playerSettings, setPlayerSettings] = useState(getPlayerSettings());
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(playerSettings.name);
  const [copySuccess, setCopySuccess] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [winThresholdInput, setWinThresholdInput] = useState(() => playerSettings.winThreshold.toString());
  const [isEditingWinThreshold, setIsEditingWinThreshold] = useState(false);
  const [consentStatus, setConsentStatusState] = useState(getConsentStatus());

  const MIN_WIN_THRESHOLD = 100;
  const MAX_WIN_THRESHOLD = 100000;
  const selectedVariant = isSupportedVariant(playerSettings.variant) ? playerSettings.variant : DEFAULT_VARIANT;
  const variantOptions: Array<{ id: BeziqueVariantId; label: string }> = [
    { id: 'classic', label: t`Classic Bezique` },
    { id: 'turkish', label: t`Turkish Bezique` },
  ];
  const disabledWhileConnectedTooltip = t`Disabled while connected to an opponent`;

  // Update player settings when modal opens
  useEffect(() => {
    if (isOpen) {
      const settings = getPlayerSettings();
      setPlayerSettings(settings);
      setTempName(settings.name);
      setWinThresholdInput(settings.winThreshold.toString());
      
      // Update sound setting if it differs from stored setting
      if (settings.soundEnabled !== soundEnabled) {
        onSoundEnabledChange(settings.soundEnabled);
      }
    }
  }, [isOpen, soundEnabled, onSoundEnabledChange]);

  useEffect(() => {
    setWinThresholdInput(winThreshold.toString());
  }, [winThreshold]);

  // Listen for consent changes
  useEffect(() => {
    const handleConsentChange = () => {
      setConsentStatusState(getConsentStatus());
    };
    
    window.addEventListener('consent-changed', handleConsentChange);
    return () => window.removeEventListener('consent-changed', handleConsentChange);
  }, []);

  const buildShareUrl = (playerID: string): string => {
    const { origin, pathname } = window.location;
    const basePath = `${origin}${pathname}`;
    return `${basePath}?pid=${playerID}`;
  };

  const resolveShareablePlayerID = async (): Promise<string | null> => {
    try {
      const currentID = GameServerAPI.getCurrentPlayerID();
      if (currentID && /^\d{4,12}$/.test(currentID)) {
        if (playerSettings.playerID !== currentID) {
          setPlayerSettings(prev => ({ ...prev, playerID: currentID }));
        }
        return currentID;
      }
      const fallback = playerSettings.playerID;
      if (fallback && /^\d{4,12}$/.test(fallback)) {
        return fallback;
      }
      const reconnected = await GameServerAPI.connectWithRetry();
      if (/^\d{4,12}$/.test(reconnected)) {
        setPlayerSettings(prev => ({ ...prev, playerID: reconnected }));
        return reconnected;
      }
      return null;
    } catch (error) {
      console.warn('Unable to resolve player ID for sharing:', error);
      return null;
    }
  };

  // Handle sound setting change
  const handleSoundChange = (enabled: boolean) => {
    onSoundEnabledChange(enabled);
    updatePlayerSetting('soundEnabled', enabled);
    setPlayerSettings(prev => ({ ...prev, soundEnabled: enabled }));
  };

  // Handle copy player ID to clipboard
  const handleCopyPlayerID = async () => {
    const id = await resolveShareablePlayerID();
    if (!id) return;
    const success = await copyToClipboard(buildShareUrl(id));
    if (success) {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  // Handle share player ID
  const handleSharePlayerID = async () => {
    const id = await resolveShareablePlayerID();
    if (!id) return;
    const shareUrl = buildShareUrl(id);
    const shareData = {
      title: t`Join me in Bezique!`,
      url: shareUrl
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

  const handleWinThresholdInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setWinThresholdInput(event.target.value);
  };

  const commitWinThreshold = () => {
    const parsed = Number(winThresholdInput);
    if (!Number.isFinite(parsed)) {
      setWinThresholdInput(playerSettings.winThreshold.toString());
      setIsEditingWinThreshold(false);
      return;
    }

    const sanitized = Math.max(MIN_WIN_THRESHOLD, Math.min(MAX_WIN_THRESHOLD, Math.round(parsed)));
    if (sanitized !== playerSettings.winThreshold) {
      updatePlayerSetting('winThreshold', sanitized);
      setPlayerSettings(prev => ({ ...prev, winThreshold: sanitized }));
      onWinThresholdChange(sanitized);
    }
    setWinThresholdInput(sanitized.toString());
    setIsEditingWinThreshold(false);
  };

  const handleWinThresholdKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      commitWinThreshold();
    }
    if (event.key === 'Escape') {
      setWinThresholdInput(playerSettings.winThreshold.toString());
      setIsEditingWinThreshold(false);
    }
  };

  const toggleWinThresholdEdit = () => {
    if (isOpponentConnected) {
      return;
    }
    if (isEditingWinThreshold) {
      commitWinThreshold();
    } else {
      setIsEditingWinThreshold(true);
      setWinThresholdInput(playerSettings.winThreshold.toString());
    }
  };

  const handleVariantChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (isOpponentConnected) return;
    const nextVariant = event.target.value;
    if (!isSupportedVariant(nextVariant)) return;
    if (nextVariant === selectedVariant) return;
    updatePlayerSetting('variant', nextVariant);
    setPlayerSettings(prev => ({ ...prev, variant: nextVariant }));
    onVariantChange(nextVariant);
  };

  useEffect(() => {
    if (isOpponentConnected && isEditingWinThreshold) {
      setIsEditingWinThreshold(false);
      setWinThresholdInput(playerSettings.winThreshold.toString());
    }
  }, [isOpponentConnected, isEditingWinThreshold, playerSettings.winThreshold]);

  const handleRevokeConsent = () => {
    setConsent(false);
    setConsentStatusState('rejected');
    showToast(
      t`Analytics consent has been revoked. Tracking is now disabled.`,
      'info',
      4000
    );
  };

  const handleGrantConsent = () => {
    setConsent(true);
    setConsentStatusState('accepted');
    showToast(
      t`Analytics consent has been granted. Anonymous usage data will be collected to improve the app.`,
      'success',
      5000
    );
  };

  const getConsentStatusText = () => {
    switch (consentStatus) {
      case 'accepted':
        return t`Analytics enabled`;
      case 'rejected':
        return t`Analytics disabled`;
      case 'not-asked':
        return t`Not set`;
      default:
        return t`Unknown`;
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}><Trans>Settings</Trans></h3>
          <button className={styles.modalClose} onClick={onClose}>
            <X size={ICON_SIZE} />
          </button>
        </div>
        
        <div className={styles.settingsContent}>
          {/* Player ID Section */}
            <div className={styles.playerIDSection}>
              <span className={styles.playerIDLabel}><Trans>Player ID</Trans></span>
              <div
                className={`${styles.playerIDDisplay} ${styles.playerIDCentered}`}
                aria-label={t`Your Player ID`}
              >
                <span className={styles.playerIDText}>{playerSettings.playerID}</span>
                
                <div className={styles.playerIDActions}>
                  <button
                    className={styles.playerActionButton}
                    onClick={handleCopyPlayerID}
                    title={t`Copy Player ID`}
                  >
                    {copySuccess ? <Check size={18} /> : <Copy size={18} />}
                  </button>

                  <button
                    className={styles.playerActionButton}
                    onClick={handleSharePlayerID}
                    title={t`Share Player ID`}
                  >
                    {shareSuccess ? <Check size={18} /> : <Share size={18} />}
                  </button>

                  <button
                    className={styles.playerActionButton}
                    onClick={onPlayerSearchOpen}
                    title={t`Search Players`}
                  >
                    <Search size={18} />
                  </button>

                  <button
                    className={styles.playerActionButton}
                    onClick={onGeolocationSearchOpen}
                    title={t`Find Nearby Players`}
                  >
                    <MapPin size={18} />
                  </button>
                </div>
              </div>
            </div>

          {/* Player Name Section */}
          <div className={styles.settingsSection}>
            <h4 className={styles.settingsTitle}><Trans>Player Name</Trans></h4>
            <div className={styles.playerNameSection}>
              {isEditingName ? (
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  onKeyDown={handleNameKeyPress}
                  className={styles.playerNameInput}
                  placeholder={t`Enter your player name`}
                  maxLength={20}
                  autoFocus
                />
              ) : (
                <span className={styles.playerNameDisplay}>{playerSettings.name}</span>
              )}

              <button
                className={styles.playerNameEditButton}
                onClick={handleEditName}
                title={isEditingName ? t`Save Name` : t`Edit Name`}
              >
                {isEditingName ? <Save size={18} /> : <Edit size={18} />}
              </button>
            </div>
          </div>

          {/* Language Section */}
          <div className={styles.settingsSection}>
            <div className={styles.settingsOption}>
              <span className={styles.settingsLabel}><Trans>Language</Trans></span>
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

          {/* Variant Section */}
          <div className={styles.settingsSection}>
            <div className={styles.settingsOption}>
              <span className={styles.settingsLabel}><Trans>Variant</Trans></span>
              <select
                className={styles.languageSelect}
                value={selectedVariant}
                onChange={handleVariantChange}
                disabled={isOpponentConnected}
                title={isOpponentConnected ? disabledWhileConnectedTooltip : undefined}
              >
                {variantOptions.map(option => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Win Threshold and Audio Section - Two Column Layout */}
          <div className={styles.settingsTwoColumn}>
            {/* Target Score */}
            <div className={styles.settingsSection}>
              <h4 className={styles.settingsTitle}><Trans>Target Score</Trans></h4>
              <div className={styles.winThresholdSection}>
                {isEditingWinThreshold ? (
                  <input
                    type="number"
                    min={MIN_WIN_THRESHOLD}
                    max={MAX_WIN_THRESHOLD}
                    step={10}
                    value={winThresholdInput}
                    onChange={handleWinThresholdInputChange}
                    onKeyDown={handleWinThresholdKeyDown}
                    className={styles.winThresholdInput}
                    inputMode="numeric"
                    autoFocus
                  />
                ) : (
                  <span className={styles.winThresholdDisplay}>{formatNumber(playerSettings.winThreshold)}</span>
                )}

                <button
                  className={styles.playerNameEditButton}
                  onClick={toggleWinThresholdEdit}
                  title={
                    isOpponentConnected
                      ? disabledWhileConnectedTooltip
                      : isEditingWinThreshold ? t`Save Name` : t`Edit Name`
                  }
                  disabled={isOpponentConnected}
                >
                  {isEditingWinThreshold ? <Save size={18} /> : <Edit size={18} />}
                </button>
              </div>
            </div>

            {/* Sound Effects */}
            <div className={styles.settingsSection}>
              <h4 className={styles.settingsTitle}><Trans>Sound Effects</Trans></h4>
              <div className={styles.settingsOption} style={{ justifyContent: 'center' }}>
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

          {/* Privacy & Data Section */}
          <div className={styles.settingsSection}>
            <div className={styles.settingsOption}>
              <span className={styles.settingsLabel}>
                <Trans>Privacy & Data</Trans>: {getConsentStatusText()}
              </span>
              <button
                className={styles.playerActionButton}
                onClick={onPrivacyOpen}
                title={t`Privacy Information`}
              >
                <Shield size={18} />
              </button>
            </div>
            {consentStatus === 'accepted' && (
              <div className={styles.settingsOption}>
                <button
                  className={`${styles.modalButton} ${styles.modalButtonCancel}`}
                  onClick={handleRevokeConsent}
                  style={{ width: '100%', marginTop: '8px' }}
                >
                  <Trans>Revoke Analytics Consent</Trans>
                </button>
              </div>
            )}
            {consentStatus === 'rejected' && (
              <div className={styles.settingsOption}>
                <button
                  className={`${styles.modalButton}`}
                  onClick={handleGrantConsent}
                  style={{ width: '100%', marginTop: '8px' }}
                >
                  <Trans>Enable Analytics</Trans>
                </button>
              </div>
            )}
            {consentStatus === 'not-asked' && (
              <div className={styles.settingsOption}>
                <p className={styles.settingsLabel} style={{ fontSize: '0.9em', opacity: 0.8 }}>
                  <Trans>No choice has been made yet</Trans>
                </p>
              </div>
            )}
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button className={`${styles.modalButton} ${styles.modalButtonCancel}`} onClick={onClose}>
            <Trans>Close</Trans>
          </button>
        </div>
      </div>
    </div>
  );
};
