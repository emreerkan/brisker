import React from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import styles from '@/components/Brisker.module.css';

interface PointButtonsProps {
  selectedPoint: number | null;
  isProcessing: boolean;
  onPointClick: (points: number) => void;
  pointValues: number[];
}

export const PointButtons: React.FC<PointButtonsProps> = ({
  selectedPoint,
  isProcessing,
  onPointClick,
  pointValues
}) => {
  const { formatNumber } = useLanguage();

  return (
    <>
      {/* Row 2-5: Point buttons (4 rows of 4 buttons each) */}
      {pointValues.map(value => (
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
