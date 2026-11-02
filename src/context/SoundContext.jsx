import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const SoundContext = createContext();

export function SoundProvider({ children }) {
  const [isEnabled, setIsEnabled] = useState(false);
  const [audioCtx, setAudioCtx] = useState(null);

  const initAudio = useCallback(() => {
    if (!audioCtx) {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      setAudioCtx(ctx);
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }, [audioCtx]);

  const toggleSound = () => {
    if (!isEnabled) initAudio();
    setIsEnabled(!isEnabled);
  };

  const playBassHit = useCallback(() => {
    if (!isEnabled || !audioCtx) return;
    
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(60, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1.2);
    
    gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 1.2);
  }, [isEnabled, audioCtx]);

  const playSoftClick = useCallback(() => {
    if (!isEnabled || !audioCtx) return;
    
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, audioCtx.currentTime);
    
    gain.gain.setValueAtTime(0.015, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.05);
  }, [isEnabled, audioCtx]);

  return (
    <SoundContext.Provider value={{ isEnabled, toggleSound, playBassHit, playSoftClick }}>
      {children}
    </SoundContext.Provider>
  );
}

export const useSound = () => useContext(SoundContext);
