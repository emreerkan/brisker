import React from 'react';
import { X } from 'lucide-react';
import { useLingui } from '@lingui/react/macro';
import type { ModalProps } from '@/types';
import { ICON_SIZE, MAX_BRISK_VALUE } from '@/utils/constants';
import styles from '@/components/Brisker.module.css';

interface BriskSelectorProps extends ModalProps {
  onBriskSelect: (brisk: number) => void;
}

export const BriskSelector: React.FC<BriskSelectorProps> = ({
  isOpen,
  onClose,
  onBriskSelect
}) => {
  const { t } = useLingui();

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>{t`Select Brisk`}</h3>
          <button className={styles.modalClose} onClick={onClose}>
            <X size={ICON_SIZE} />
          </button>
        </div>
        
        <div className={styles.briskGrid}>
          {Array.from({ length: MAX_BRISK_VALUE }, (_, i) => i + 1).map(value => (
            <button
              key={value}
              className={styles.briskButton}
              onClick={() => onBriskSelect(value)}
            >
              {value}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
