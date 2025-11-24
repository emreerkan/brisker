import { hasConsent } from './consent';

// Google Analytics tracking ID
// In development: reads from VITE_GA_TRACKING_ID env variable
// In production: placeholder '__GA_TRACKING_ID__' is replaced during deployment
const GA_TRACKING_ID = import.meta.env.VITE_GA_TRACKING_ID || '__GA_TRACKING_ID__';

// Track if GA has been loaded
let gaLoaded = false;

/**
 * Initialize Google Analytics if user has given consent
 */
export const initializeAnalytics = (): void => {
  // Only load GA if user has consented and it hasn't been loaded yet
  if (!hasConsent() || gaLoaded || GA_TRACKING_ID === '__GA_TRACKING_ID__') {
    console.log('Google Analytics not initialized:', {
      hasConsent: hasConsent(),
      gaLoaded,
      hasTrackingId: GA_TRACKING_ID !== '__GA_TRACKING_ID__'
    });
    return;
  }

  // Create and append GA script
  const script1 = document.createElement('script');
  script1.async = true;
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`;
  document.head.appendChild(script1);

  // Initialize dataLayer and gtag function
  window.dataLayer = window.dataLayer || [];
  function gtag(...args: any[]) {
    window.dataLayer.push(args);
  }
  window.gtag = gtag;

  gtag('js', new Date());
  gtag('config', GA_TRACKING_ID);

  gaLoaded = true;
  console.log('Google Analytics initialized with user consent');
};

/**
 * Track a custom event (only if consent given and GA loaded)
 */
export const trackEvent = (eventName: string, params?: Record<string, any>): void => {
  if (!hasConsent() || !gaLoaded) {
    return;
  }

  if (window.gtag) {
    window.gtag('event', eventName, params);
  }
};

// Extend Window interface for TypeScript
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}
