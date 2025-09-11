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
      const shareText = `${data.title}\n${data.text}\n${data.url || ''}`.trim();
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

// Get user's geolocation
export const getGeolocation = (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => resolve(position),
      (error) => reject(error),
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  });
};
