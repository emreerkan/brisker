import { useState, useEffect } from 'react';
import type { WindowSize } from '@/types';

export const useWindowSize = (): WindowSize => {
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    // Development-only: Add keyboard shortcut to test congratulations (Ctrl+Shift+W)
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'W') {
        event.preventDefault();
        // This will be passed as a callback from the main component
        if (windowSize.width > 0) { // Just a check to access windowSize in this scope
          const customEvent = new CustomEvent('triggerCongratulations');
          window.dispatchEvent(customEvent);
        }
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [windowSize.width]);

  return windowSize;
};
