import React from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { POINT_VALUES } from '@/utils/constants';
import styles from '@/components/Brisker.module.css';

interface PointButtonsProps {
  selectedPoint: number | null;
  isProcessing: boolean;
  onPointClick: (points: number) => void;
}

export const PointButtons: React.FC<PointButtonsProps> = ({
  selectedPoint,
  isProcessing,
  onPointClick
}) => {
  const { formatNumber } = useLanguage();

  return (
    <>
      {/* Row 2-5: Point buttons (4 rows of 4 buttons each) */}
      {POINT_VALUES.map(value => (
        <button
          key={value}
          className={`${styles.point} ${selectedPoint === value ? styles.selected : ''}`}
          onClick={() => onPointClick(value)}
          disabled={isProcessing}
        >
          {formatNumber(value)}
        </button>
      ))}
    </>
  );
};
