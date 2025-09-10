import React from 'react';
import { RotateCcw, Settings, Info } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { ICON_SIZE } from '../../utils/constants';
import styles from '../BeziqueScoreKeeper.module.css';

interface ActionButtonsProps {
  isProcessing: boolean;
  onBriskClick: () => void;
  onResetClick: () => void;
  onSettingsClick: () => void;
  onInfoClick: () => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  isProcessing,
  onBriskClick,
  onResetClick,
  onSettingsClick,
  onInfoClick
}) => {
  const { t } = useLanguage();

  return (
    <>
      {/* Row 6: Brisk + Reset + Settings + Info */}
      <button
        className={styles.brisk}
        onClick={onBriskClick}
        disabled={isProcessing}
        title={t.briskDescription}
      >
        {t.brisk}
      </button>
      
      <button
        className={styles.reset}
        onClick={onResetClick}
        disabled={isProcessing}
        title={t.resetScoreTooltip}
      >
        <RotateCcw size={ICON_SIZE} />
      </button>
      
      <button
        className={styles.settings}
        onClick={onSettingsClick}
        disabled={isProcessing}
        title={t.settingsTooltip}
      >
        <Settings size={ICON_SIZE} />
      </button>
      
      <button
        className={styles.info}
        onClick={onInfoClick}
        disabled={isProcessing}
        title={t.appInformationTooltip}
      >
        <Info size={ICON_SIZE} />
      </button>
    </>
  );
};
