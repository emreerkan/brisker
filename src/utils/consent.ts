/**
 * GDPR Consent Management
 * 
 * Simple consent management for Google Analytics tracking.
 * Stores user's choice in localStorage and provides utilities to check consent status.
 */

const CONSENT_KEY = 'brisker_analytics_consent';

export type ConsentStatus = 'accepted' | 'rejected' | 'not-asked';

/**
 * Get the current consent status
 */
export const getConsentStatus = (): ConsentStatus => {
  try {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (stored === 'true') return 'accepted';
    if (stored === 'false') return 'rejected';
    return 'not-asked';
  } catch (error) {
    console.warn('Failed to read consent status:', error);
    return 'not-asked';
  }
};

/**
 * Check if user has given consent for analytics
 */
export const hasConsent = (): boolean => {
  return getConsentStatus() === 'accepted';
};

/**
 * Set the user's consent choice
 */
export const setConsent = (consent: boolean): void => {
  try {
    localStorage.setItem(CONSENT_KEY, consent.toString());
    
    // Dispatch event so other parts of the app can react to consent changes
    window.dispatchEvent(new CustomEvent('consent-changed', { 
      detail: { consent } 
    }));

    // If consent is given, initialize analytics immediately
    if (consent) {
      // Dynamic import to avoid circular dependency
      import('./analytics').then(({ initializeAnalytics }) => {
        initializeAnalytics();
      });
    }
  } catch (error) {
    console.error('Failed to save consent status:', error);
  }
};

/**
 * Clear consent status (for testing only - resets to not-asked state)
 */
export const clearConsent = (): void => {
  try {
    localStorage.removeItem(CONSENT_KEY);
    window.dispatchEvent(new CustomEvent('consent-changed', { 
      detail: { consent: null } 
    }));
  } catch (error) {
    console.error('Failed to clear consent status:', error);
  }
};
