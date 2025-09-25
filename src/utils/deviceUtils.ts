// Copy text to clipboard
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const result = document.execCommand('copy');
      document.body.removeChild(textArea);
      return result;
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
};

// Share content using native sharing if available
export const shareContent = async (data: ShareData): Promise<boolean> => {
  try {
    if (navigator.share) {
      await navigator.share(data);
      return true;
    } else {
      // Fallback: try to copy to clipboard
      const shareText = `${data.title}\n${data.url || ''}`.trim();
      return await copyToClipboard(shareText);
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      // User cancelled sharing
      return false;
    }
    console.error('Failed to share:', error);
    return false;
  }
};

// TypeScript interface extension for iOS standalone mode
declare global {
  interface Navigator {
    standalone?: boolean;
  }
}

// Check if running on iOS
const isIOS = (): boolean => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
};

// Get iOS version
const getIOSVersion = (): number => {
  const match = navigator.userAgent.match(/OS (\d+)_/);
  return match ? parseInt(match[1], 10) : 0;
};

// Check if running as iOS PWA (standalone mode)
const isIOSPWA = (): boolean => {
  return (
    (window.navigator as any).standalone === true ||
    window.matchMedia('(display-mode: standalone)').matches
  ) && isIOS();
};

// Get Safari URL for current page (to offer fallback)
export const getSafariURL = (): string => {
  return window.location.href;
};

// Check permissions API support and query geolocation permission
const checkGeolocationPermission = async (): Promise<string> => {
  if ('permissions' in navigator) {
    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
      console.log('Geolocation permission query result:', permission.state);
      return permission.state;
    } catch (error) {
      console.log('Permissions API not fully supported or failed:', error);
    }
  }
  return 'unknown';
};

// Additional function to test if geolocation is available at all
const isGeolocationSupported = (): boolean => {
  const supported = 'geolocation' in navigator && typeof navigator.geolocation.getCurrentPosition === 'function';
  console.log('Geolocation API supported:', supported);
  return supported;
};

// Get user's geolocation with iOS PWA-specific handling
export const getGeolocation = (): Promise<GeolocationPosition> => {
  return new Promise(async (resolve, reject) => {
    // First check if geolocation is supported
    if (!isGeolocationSupported()) {
      reject(new Error('Geolocation is not supported by this browser or device'));
      return;
    }

    // Check permission status first
    const permissionState = await checkGeolocationPermission();
    const iosVersion = getIOSVersion();
    console.log('Geolocation permission state:', permissionState, 'iOS version:', iosVersion, 'is PWA:', isIOSPWA());

    // iOS PWA-specific configuration
    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: isIOSPWA() ? 15000 : 10000, // Longer timeout for iOS PWA
      maximumAge: isIOSPWA() ? 300000 : 60000 // Longer cache for iOS PWA (5 mins vs 1 min)
    };

    // Enhanced success callback with iOS-specific handling
    const successCallback = (position: GeolocationPosition) => {
      console.log('Geolocation success:', {
        coords: position.coords,
        timestamp: position.timestamp,
        isIOSPWA: isIOSPWA(),
        accuracy: position.coords.accuracy
      });
      resolve(position);
    };

    // Enhanced error callback with detailed iOS handling
    const errorCallback = (error: GeolocationPositionError) => {
      console.error('Geolocation error:', {
        code: error.code,
        message: error.message,
        isIOSPWA: isIOSPWA(),
        permissionState,
        iosVersion
      });

      // Create a more descriptive error for iOS PWAs
      let enhancedError = error;
      
      if (isIOSPWA() && error.code === GeolocationPositionError.PERMISSION_DENIED) {
        // For iOS PWA, permission denied often means system-level location services are off
        // or the specific site permission needs to be reset
        let message = 'Location access denied. For iOS PWA apps, please:\n\n' +
          '1. Open iPhone Settings > Privacy & Security > Location Services\n' +
          '2. Ensure Location Services is ON\n' +
          '3. Scroll down to Safari Websites\n' +
          '4. Ensure it\'s set to "Ask Next Time or When I Share"\n' +
          '5. Return to the app and try again\n\n' +
          'You may also need to remove and re-add the app to your home screen.\n\n' +
          'Alternative: You can also try opening this app in Safari browser instead of the home screen app.';
        
        // Add iOS version-specific guidance
        if (iosVersion >= 16) {
          message += '\n\nFor iOS 16+: Make sure "Precise Location" is enabled in Safari Website settings.';
        }
        
        enhancedError = Object.assign(new Error(message), {
          code: error.code,
          PERMISSION_DENIED: GeolocationPositionError.PERMISSION_DENIED,
          POSITION_UNAVAILABLE: GeolocationPositionError.POSITION_UNAVAILABLE,
          TIMEOUT: GeolocationPositionError.TIMEOUT,
          name: 'GeolocationPositionError'
        });
      } else if (isIOSPWA() && error.code === GeolocationPositionError.TIMEOUT) {
        // iOS PWA timeout might be due to system-level restrictions
        const message = 'Location request timed out. This often happens in iOS PWAs when:\n\n' +
          '1. Location Services are disabled at system level\n' +
          '2. You\'re in an area with poor GPS signal\n' +
          '3. The app doesn\'t have proper location permissions\n\n' +
          'Please check Location Services in Settings and try again.';
        
        enhancedError = Object.assign(new Error(message), {
          code: error.code,
          PERMISSION_DENIED: GeolocationPositionError.PERMISSION_DENIED,
          POSITION_UNAVAILABLE: GeolocationPositionError.POSITION_UNAVAILABLE,
          TIMEOUT: GeolocationPositionError.TIMEOUT,
          name: 'GeolocationPositionError'
        });
      }

      reject(enhancedError);
    };

    // For iOS PWAs, try to request permission more carefully
    if (isIOSPWA()) {
      console.log('iOS PWA detected, using enhanced geolocation handling...');
      
      // Try a quick test first to see if permissions are available
      try {
        navigator.geolocation.getCurrentPosition(
          successCallback, 
          errorCallback, 
          {
            enableHighAccuracy: false,
            timeout: 8000,
            maximumAge: 0
          }
        );
      } catch (error) {
        console.error('Geolocation request failed:', error);
        errorCallback(error as GeolocationPositionError);
      }
    } else {
      // Standard geolocation request for non-iOS or browser mode
      navigator.geolocation.getCurrentPosition(successCallback, errorCallback, options);
    }
  });
};
