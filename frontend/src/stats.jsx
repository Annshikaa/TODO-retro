import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import Navbar from './components/Navbar';
import RetroOverlay from './components/RetroOverlay';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

function Stats() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_URL}/todos`);
      if (!res.ok) throw new Error('API down');
      const data = await res.json();
      setTodos(data);
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const total = todos.length;
  const completed = todos.filter(t => t.completed).length;
  const pending = total - completed;
  const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

  // Group completed by priority
  const completedLow = todos.filter(t => t.completed && t.priority === 'LOW').length;
  const completedMedium = todos.filter(t => t.completed && t.priority === 'MEDIUM').length;
  const completedHigh = todos.filter(t => t.completed && t.priority === 'HIGH').length;
  const completedBoss = todos.filter(t => t.completed && t.priority === 'BOSS').length;

  const xp = parseInt(localStorage.getItem('playerXP') || '0', 10);
  const lvl = Math.floor(xp / 100) + 1;
  const currentLvlXp = xp % 100;

  return (
    <div className="container">
      <RetroOverlay />
      <Navbar activePage="stats" />

      <h1>CHARACTER STATUS 📊</h1>

      {error ? (
        <div className="game-state-screen">
          <p className="offline-title">ERROR: API UNREACHABLE</p>
          <p style={{ color: 'var(--text-muted)' }}>Could not compile player stats. Reboot connection. 🔌</p>
        </div>
      ) : loading ? (
        <div className="game-state-screen" style={{ borderStyle: 'solid' }}>
          <p className="player-name" style={{ fontSize: '1.5rem', animation: 'blink 1s infinite alternate' }}>CALCULATING STATISTICS... ⏳</p>
        </div>
      ) : (
        <div className="todo-details-card" style={{ textAlign: 'left' }}>
          <h2 style={{ fontSize: '1.2rem', textAlign: 'center', color: 'var(--secondary)', textShadow: 'none', marginBottom: '2rem' }}>
            ADVENTURER XP SCOREBOARD
          </h2>
          
          <div className="stat-row">
            <span style={{ color: 'var(--text-muted)' }}>Overall Player Level</span>
            <span className="stat-value" style={{ color: 'var(--primary)' }}>LVL {lvl}</span>
          </div>
          
          <div className="stat-row">
            <span style={{ color: 'var(--text-muted)' }}>Cumulative Experience</span>
            <span className="stat-value">{xp} XP</span>
          </div>

          <div style={{ margin: '1.5rem 0 2.5rem 0' }}>
            <span style={{ color: 'var(--text-main)', fontSize: '1rem', fontWeight: 'bold' }}>
              XP PROGRESS TO LEVEL {lvl + 1} ({currentLvlXp}%)
            </span>
            <div className="progress-bar-container">
              <div className="progress-bar-fill" style={{ width: `${currentLvlXp}%` }}></div>
            </div>
          </div>

          <h2 style={{ fontSize: '1.2rem', color: 'var(--secondary)', textShadow: 'none', margin: '2.5rem 0 1.5rem 0', borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            TODO COMPLETION BREAKDOWN
          </h2>

          <div className="stat-row">
            <span style={{ color: 'var(--text-muted)' }}>All Logged Todos 🎯</span>
            <span className="stat-value">{total}</span>
          </div>

          <div className="stat-row">
            <span style={{ color: 'var(--text-muted)' }}>Defeated / Completed 🏆</span>
            <span className="stat-value" style={{ color: 'var(--accent)' }}>{completed}</span>
          </div>

          <div className="stat-row">
            <span style={{ color: 'var(--text-muted)' }}>Pending Todos 🕰️</span>
            <span className="stat-value" style={{ color: 'var(--warning)' }}>{pending}</span>
          </div>

          <div style={{ margin: '1.5rem 0 2.5rem 0' }}>
            <span style={{ color: 'var(--text-main)', fontSize: '1rem', fontWeight: 'bold' }}>
              SECTOR WIN-RATE ({progress}%)
            </span>
            <div className="progress-bar-container">
              <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
            </div>
          </div>

          <h2 style={{ fontSize: '1.2rem', color: 'var(--secondary)', textShadow: 'none', margin: '2.5rem 0 1.5rem 0', borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            CLEAR STATS BY DIFFICULTY
          </h2>

          <div className="stat-row">
            <span style={{ color: 'var(--text-muted)' }}>Chill Tasks Completed 🧊</span>
            <span className="stat-value" style={{ fontSize: '1.1rem' }}>{completedLow}</span>
          </div>

          <div className="stat-row">
            <span style={{ color: 'var(--text-muted)' }}>Normal Tasks Completed 🎈</span>
            <span className="stat-value" style={{ fontSize: '1.1rem' }}>{completedMedium}</span>
          </div>

          <div className="stat-row">
            <span style={{ color: 'var(--text-muted)' }}>High Energy Completed 🔥</span>
            <span className="stat-value" style={{ fontSize: '1.1rem' }}>{completedHigh}</span>
          </div>

          <div className="stat-row">
            <span style={{ color: 'var(--text-muted)' }}>Super Bosses Completed 🚨</span>
            <span className="stat-value" style={{ color: 'var(--boss)', fontSize: '1.1rem' }}>{completedBoss}</span>
          </div>
        </div>
      )}
    </div>
  );
}

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <Stats />
  </React.StrictMode>
);
