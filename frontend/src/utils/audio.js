// Retro 8-bit Sound Synthesizer using Web Audio API

let audioCtx = null;

const getAudioContext = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
};

const isSFXEnabled = () => {
  return localStorage.getItem('retroSFX') !== 'false';
};

// Play a classic 8-bit tone
const playTone = (freqs, durations, type = 'square', volume = 0.1) => {
  if (!isSFXEnabled()) return;
  
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    // Create nodes
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.type = type;
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    // Set volume envelope
    gainNode.gain.setValueAtTime(volume, now);
    
    let timeCursor = now;
    freqs.forEach((freq, idx) => {
      const dur = durations[idx];
      osc.frequency.setValueAtTime(freq, timeCursor);
      timeCursor += dur;
    });
    
    // Fade out at the end
    gainNode.gain.exponentialRampToValueAtTime(0.0001, timeCursor);
    
    osc.start(now);
    osc.stop(timeCursor + 0.1);
  } catch (err) {
    console.warn('Audio play failed:', err);
  }
};

export const playSelectSound = () => {
  // Classic 8-bit blip
  playTone([600], [0.08], 'square', 0.05);
};

export const playCoinSound = () => {
  // Classic 8-bit coin chime (two notes ascending)
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  
  try {
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    osc.type = 'square';
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    gainNode.gain.setValueAtTime(0.05, now);
    osc.frequency.setValueAtTime(987.77, now); // B5
    
    osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6
    gainNode.gain.setValueAtTime(0.05, now + 0.08);
    
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
    
    osc.start(now);
    osc.stop(now + 0.4);
  } catch (err) {
    console.warn('Audio play failed:', err);
  }
};

export const playLaserSound = () => {
  // Classic 8-bit laser sweep down
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  
  try {
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    osc.type = 'sawtooth';
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    gainNode.gain.setValueAtTime(0.05, now);
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.18);
    
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
    
    osc.start(now);
    osc.stop(now + 0.22);
  } catch (err) {
    console.warn('Audio play failed:', err);
  }
};

export const playBuzzerSound = () => {
  // Low buzz for errors
  playTone([130], [0.25], 'sawtooth', 0.08);
};

export const playLevelUpSound = () => {
  // Upward arpeggio fanfare
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  
  try {
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    osc.type = 'triangle';
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    gainNode.gain.setValueAtTime(0.08, now);
    
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // C4, E4, G4, C5, E5, G5, C6
    const step = 0.08;
    
    notes.forEach((freq, idx) => {
      osc.frequency.setValueAtTime(freq, now + idx * step);
    });
    
    gainNode.gain.setValueAtTime(0.08, now + notes.length * step - 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + notes.length * step + 0.3);
    
    osc.start(now);
    osc.stop(now + notes.length * step + 0.4);
  } catch (err) {
    console.warn('Audio play failed:', err);
  }
};
