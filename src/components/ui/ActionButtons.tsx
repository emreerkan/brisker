import React from 'react';
import { RotateCcw, Settings, Info } from 'lucide-react';
import { useLingui } from '@lingui/react/macro';
import { ICON_SIZE } from '@/utils/constants';
import styles from '@/components/Brisker.module.css';

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
  const { t } = useLingui();

  return (
    <>
      {/* Row 6: Brisk + Reset + Settings + Info */}
      <button
        className={styles.brisk}
        onClick={onBriskClick}
        disabled={isProcessing}
        title={t`Select brisk number (adds brisk x 20 points)`}
      >
        {t`Brisk`}
      </button>
      
      <button
        className={styles.reset}
        onClick={onResetClick}
        disabled={isProcessing}
        title={t`Reset score`}
      >
        <RotateCcw size={ICON_SIZE} />
      </button>
      
      <button
        className={styles.settings}
        onClick={onSettingsClick}
        disabled={isProcessing}
        title={t`Settings`}
      >
        <Settings size={ICON_SIZE} />
      </button>
      
      <button
        className={styles.info}
        onClick={onInfoClick}
        disabled={isProcessing}
        title={t`App information`}
      >
        <Info size={ICON_SIZE} />
      </button>
    </>
  );
};
