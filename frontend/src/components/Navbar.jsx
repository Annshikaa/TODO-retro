import React, { useState, useEffect } from 'react';
import { playSelectSound } from '../utils/audio';

export default function Navbar({ activePage }) {
  const [playerName, setPlayerName] = useState('PLAYER 1');
  const [xp, setXp] = useState(0);

  const fetchPlayerStats = () => {
    setPlayerName(localStorage.getItem('arcadePlayerName') || 'PLAYER 1');
    setXp(parseInt(localStorage.getItem('playerXP') || '0', 10));
  };

  useEffect(() => {
    fetchPlayerStats();
    
    // Watch for updates (like level up or name change)
    window.addEventListener('storage', fetchPlayerStats);
    window.addEventListener('playerStatsChanged', fetchPlayerStats);
    
    return () => {
      window.removeEventListener('storage', fetchPlayerStats);
      window.removeEventListener('playerStatsChanged', fetchPlayerStats);
    };
  }, []);

  const lvl = Math.floor(xp / 100) + 1;
  const currentLvlXp = xp % 100;
  
  // Rank title
  let rank = 'TASK NOOB ⚔️';
  if (lvl === 2) rank = 'CODE GRINDER 🗺️';
  else if (lvl === 3) rank = 'BUG SLAYER 🔫';
  else if (lvl === 4) rank = 'ARCADE CHAMP 🏆';
  else if (lvl >= 5) rank = 'LEGENDARY HERO 👑';

  const handleLinkClick = (e, url) => {
    e.preventDefault();
    playSelectSound();
    // Short timeout to let the click sound register before page transition
    setTimeout(() => {
      window.location.href = url;
    }, 80);
  };

  return (
    <div className="arcade-header">
      {/* Player status widget */}
      <div className="player-card">
        <div className="player-avatar">👾</div>
        <div className="player-info">
          <div className="player-meta">
            <span className="player-name">{playerName}</span>
            <span className="player-level">LVL {lvl}</span>
          </div>
          <div className="player-rank-row">
            <span className="player-rank">{rank}</span>
            <span className="player-xp-count">{currentLvlXp}/100 XP</span>
          </div>
          <div className="mini-xp-container">
            <div className="mini-xp-bar" style={{ width: `${currentLvlXp}%` }}></div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className="navbar">
        <a 
          href="/" 
          className={activePage === 'home' ? 'active' : ''} 
          onClick={(e) => handleLinkClick(e, '/')}
        >
          DASHBOARD 🏠
        </a>
        <a 
          href="/add.html" 
          className={activePage === 'add' ? 'active' : ''} 
          onClick={(e) => handleLinkClick(e, '/add.html')}
        >
          ADD TODO ✏️
        </a>
        <a 
          href="/stats.html" 
          className={activePage === 'stats' ? 'active' : ''} 
          onClick={(e) => handleLinkClick(e, '/stats.html')}
        >
          PLAYER STATS 📊
        </a>
        <a 
          href="/settings.html" 
          className={activePage === 'settings' ? 'active' : ''} 
          onClick={(e) => handleLinkClick(e, '/settings.html')}
        >
          SETTINGS ⚙️
        </a>
      </nav>
    </div>
  );
}
