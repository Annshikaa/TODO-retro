import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import Navbar from './components/Navbar';
import RetroOverlay from './components/RetroOverlay';
import { playSelectSound, playCoinSound, playBuzzerSound } from './utils/audio';

function Settings() {
  const [playerName, setPlayerName] = useState(localStorage.getItem('arcadePlayerName') || 'PLAYER 1');
  const [sfxEnabled, setSfxEnabled] = useState(localStorage.getItem('retroSFX') !== 'false');
  const [scanlinesEnabled, setScanlinesEnabled] = useState(localStorage.getItem('retroScanlines') !== 'false');
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem('arcadePlayerName', playerName.trim() || 'PLAYER 1');
    localStorage.setItem('retroSFX', sfxEnabled ? 'true' : 'false');
    localStorage.setItem('retroScanlines', scanlinesEnabled ? 'true' : 'false');
    
    // Dispatch events to notify other components
    window.dispatchEvent(new Event('playerStatsChanged'));
    window.dispatchEvent(new Event('crtSettingsChanged'));

    setSaved(true);
    playCoinSound();
    setTimeout(() => setSaved(false), 2000);
  };

  const handleResetData = () => {
    playBuzzerSound();
    if (!window.confirm('WARNING: THIS WILL WIPE YOUR LEVEL, XP, AND RESET SETTINGS TO DEFAULT! PROCEED? ⚠️')) {
      return;
    }
    
    localStorage.setItem('arcadePlayerName', 'PLAYER 1');
    localStorage.setItem('playerXP', '0');
    localStorage.setItem('retroSFX', 'true');
    localStorage.setItem('retroScanlines', 'true');
    
    setPlayerName('PLAYER 1');
    setSfxEnabled(true);
    setScanlinesEnabled(true);

    window.dispatchEvent(new Event('playerStatsChanged'));
    window.dispatchEvent(new Event('crtSettingsChanged'));
    
    alert('PLAYER REBOOT COMPLETE. PROGRESS PURGED. 🦾');
    playCoinSound();
  };

  const toggleSfxLocal = () => {
    const newVal = !sfxEnabled;
    setSfxEnabled(newVal);
    // Temporary preview play
    if (newVal) {
      // Temporarily write to let play select sound function read it
      localStorage.setItem('retroSFX', 'true');
      playSelectSound();
      localStorage.removeItem('retroSFX'); // Clean up, will be set on submit
    }
  };

  const toggleScanlinesLocal = () => {
    setScanlinesEnabled(!scanlinesEnabled);
  };

  return (
    <div className="container">
      <RetroOverlay />
      <Navbar activePage="settings" />

      <h1>SETTINGS CONSOLE ⚙️</h1>

      <div className="todo-details-card">
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '2rem', textAlign: 'left' }}>
          <div>
            <label style={{ display: 'block', color: 'var(--secondary)', marginBottom: '0.8rem', fontSize: '0.9rem', fontFamily: "'Press Start 2P'" }}>
              ADVENTURER NAME 👤
            </label>
            <input 
              type="text" 
              value={playerName} 
              onChange={(e) => setPlayerName(e.target.value)}
              style={{ width: '100%', boxSizing: 'border-box' }}
              maxLength={20}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', color: 'var(--secondary)', marginBottom: '0.8rem', fontSize: '0.9rem', fontFamily: "'Press Start 2P'" }}>
              INTERFACE CALIBRATION 🎛️
            </label>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', marginTop: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', fontFamily: 'inherit', color: 'var(--text-main)' }}>
                <input 
                  type="checkbox" 
                  checked={sfxEnabled} 
                  onChange={toggleSfxLocal} 
                />
                <span>ENABLE 8-BIT AUDIO SYNTH SFX 🔊</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', fontFamily: 'inherit', color: 'var(--text-main)' }}>
                <input 
                  type="checkbox" 
                  checked={scanlinesEnabled} 
                  onChange={toggleScanlinesLocal} 
                />
                <span>ENABLE CRT SCANLINE FILTERS 📺</span>
              </label>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem' }}>
            <button type="submit" className="btn-secondary" style={{ flex: 1 }}>SAVE PROTOCOLS 💾</button>
            <button type="button" className="btn-danger" onClick={handleResetData} style={{ flex: 1 }}>PURGE SAVE DATA 🔌</button>
          </div>
          
          {saved && (
            <div style={{ color: 'var(--accent)', fontWeight: 'bold', fontSize: '1rem', textAlign: 'center', border: '2px solid var(--accent)', padding: '0.8rem', borderRadius: '8px', background: 'rgba(57,255,20,0.1)' }}>
              SYSTEM CHANGES SYNCED SUCCESSFULLY! ⚡
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <Settings />
  </React.StrictMode>
);
