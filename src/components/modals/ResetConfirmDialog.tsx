import React from 'react';
import { useLingui } from '@lingui/react/macro';
import type { ModalProps } from '@/types';
import styles from '@/components/Brisker.module.css';

interface ResetConfirmDialogProps extends ModalProps {
  onConfirm: () => void;
}

export const ResetConfirmDialog: React.FC<ResetConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm
}) => {
  const { t } = useLingui();

  if (!isOpen) return null;

  return (
    <div className={styles.confirmOverlay}>
      <div className={styles.confirmDialog}>
        <div className={styles.confirmMessage}>
          {t`This will delete all scores and cannot be undone.`}
        </div>
        <div className={styles.confirmButtons}>
          <button className={`${styles.confirmButton} ${styles.confirmButtonReset}`} onClick={onConfirm}>
            {t`Reset`}
          </button>
          <button className={`${styles.confirmButton} ${styles.confirmButtonCancel}`} onClick={onClose}>
            {t`Cancel`}
          </button>
        </div>
      </div>
    </div>
  );
};
