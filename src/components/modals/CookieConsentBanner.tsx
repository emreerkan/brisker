import React, { useState, useEffect } from 'react';
import { Trans } from '@lingui/macro';
import { getConsentStatus, setConsent } from '@/utils/consent';
import styles from '@/components/Brisker.module.css';

interface CookieConsentBannerProps {
  onLearnMore: () => void;
}

export const CookieConsentBanner: React.FC<CookieConsentBannerProps> = ({ onLearnMore }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show banner if user hasn't made a choice yet (first visit)
    const status = getConsentStatus();
    setIsVisible(status === 'not-asked');
  }, []);

  const handleAccept = () => {
    setConsent(true);
    setIsVisible(false);
  };

  const handleReject = () => {
    setConsent(false);
    setIsVisible(false);
  };

  const handleLearnMore = () => {
    onLearnMore();
  };

  if (!isVisible) return null;

  return (
    <div className={styles.consentOverlay}>
      <div className={styles.consentBanner}>
        <div className={styles.consentIcon}>🍪</div>
        <div className={styles.consentContent}>
          <h3 className={styles.consentTitle}><Trans>Cookie Notice</Trans></h3>
          <p className={styles.consentText}>
            <Trans>Google Analytics is used to understand app usage. Tracking can be accepted or rejected.</Trans>
          </p>
        </div>
        <div className={styles.consentActions}>
          <button
            className={`${styles.consentButton} ${styles.consentButtonSecondary}`}
            onClick={handleLearnMore}
          >
            <Trans>Learn More</Trans>
          </button>
          <button
            className={`${styles.consentButton} ${styles.consentButtonReject}`}
            onClick={handleReject}
          >
            <Trans>Reject</Trans>
          </button>
          <button
            className={`${styles.consentButton} ${styles.consentButtonAccept}`}
            onClick={handleAccept}
          >
            <Trans>Accept & Continue</Trans>
          </button>
        </div>
      </div>
    </div>
  );
};
