export const SoundType = {
  SCORE: 'score',
  TADA: 'tada',
  UNDO: 'undo',
  RESET: 'reset'
} as const;

export type SoundType = typeof SoundType[keyof typeof SoundType];

export const playSound = (soundType: SoundType, soundEnabled: boolean = true): void => {
  if (!soundEnabled) return;

  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Resume audio context if it's suspended (required by browsers after user interaction)
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }

    switch (soundType) {
      case SoundType.SCORE:
        playScoreSound(audioContext);
        break;
      case SoundType.TADA:
        playTadaSound(audioContext);
        break;
      case SoundType.UNDO:
        playUndoSound(audioContext);
        break;
      case SoundType.RESET:
        playResetSound(audioContext);
        break;
      default:
        console.warn('Unknown sound type:', soundType);
    }
  } catch (error) {
    console.warn('Audio context failed, using fallback');
  }
};

const playScoreSound = (audioContext: AudioContext): void => {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
  oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
  
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.2);
  
  // Clean up
  setTimeout(() => {
    try {
      audioContext.close();
    } catch (e) {
      // Ignore cleanup errors
    }
  }, 300);
};

const playTadaSound = (audioContext: AudioContext): void => {
  // Create a celebratory "ta-da" sound with multiple tones
  const createTone = (frequency: number, startTime: number, duration: number, volume: number = 0.3) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, startTime);
    
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
    
    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
  };

  // Ta-da melody: C-E-G-C (triumphant chord progression)
  const now = audioContext.currentTime;
  
  // Main triumphant chord (played simultaneously for richer sound)
  createTone(523, now, 0.6, 0.35);       // C5
  createTone(659, now + 0.05, 0.6, 0.3); // E5 (slightly delayed)
  createTone(784, now + 0.1, 0.6, 0.25); // G5 (more delayed)
  
  // Ascending fanfare
  createTone(1047, now + 0.3, 0.5, 0.4); // C6 (higher octave)
  createTone(1319, now + 0.5, 0.4, 0.3); // E6
  createTone(1568, now + 0.65, 0.4, 0.25); // G6
  
  // Final triumphant note
  createTone(2093, now + 0.8, 0.6, 0.35); // C7 (very high, celebratory)
  
  // Add some "sparkle" with quick high notes
  createTone(2637, now + 1.0, 0.2, 0.2); // E7
  createTone(3136, now + 1.1, 0.2, 0.15); // G7
  
  // Clean up
  setTimeout(() => {
    try {
      audioContext.close();
    } catch (e) {
      // Ignore cleanup errors
    }
  }, 1500);
};

const playUndoSound = (audioContext: AudioContext): void => {
  // Create a "swoosh back" sound for undo (descending frequency)
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.type = 'sawtooth'; // Different waveform for distinct sound
  
  // Descending frequency sweep (going backwards)
  oscillator.frequency.setValueAtTime(900, audioContext.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.25);
  
  // Quick fade in and out
  gainNode.gain.setValueAtTime(0, audioContext.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.25, audioContext.currentTime + 0.05);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.25);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.25);
  
  // Clean up
  setTimeout(() => {
    try {
      audioContext.close();
    } catch (e) {
      // Ignore cleanup errors
    }
  }, 350);
};

const playResetSound = (audioContext: AudioContext): void => {
  // Create a "whoosh reset" sound (quick sweep down then up)
  const createResetTone = (startFreq: number, endFreq: number, startTime: number, duration: number) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.type = 'triangle'; // Triangle wave for smoother reset sound
    
    oscillator.frequency.setValueAtTime(startFreq, startTime);
    oscillator.frequency.exponentialRampToValueAtTime(endFreq, startTime + duration);
    
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(0.2, startTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
    
    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
  };

  const now = audioContext.currentTime;
  
  // Two-part reset sound: sweep down then up
  createResetTone(1000, 200, now, 0.15);        // Sweep down (clearing)
  createResetTone(200, 600, now + 0.1, 0.2);    // Sweep up (fresh start)
  
  // Clean up
  setTimeout(() => {
    try {
      audioContext.close();
    } catch (e) {
      // Ignore cleanup errors
    }
  }, 400);
};