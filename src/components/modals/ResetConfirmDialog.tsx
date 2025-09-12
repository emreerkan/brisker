import React from 'react';
import type { ModalProps } from '@/types';
import { useLanguage } from '@/i18n/LanguageContext';
import styles from '../BeziqueScoreKeeper.module.css';

interface ResetConfirmDialogProps extends ModalProps {
  onConfirm: () => void;
}

export const ResetConfirmDialog: React.FC<ResetConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm
}) => {
  const { t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className={styles.confirmOverlay}>
      <div className={styles.confirmDialog}>
        <div className={styles.confirmMessage}>
          {t.resetWarning}
        </div>
        <div className={styles.confirmButtons}>
          <button className={`${styles.confirmButton} ${styles.confirmButtonReset}`} onClick={onConfirm}>
            {t.reset}
          </button>
          <button className={`${styles.confirmButton} ${styles.confirmButtonCancel}`} onClick={onClose}>
            {t.cancel}
          </button>
        </div>
      </div>
    </div>
  );
};
