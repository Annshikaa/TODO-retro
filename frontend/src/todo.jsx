import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import Navbar from './components/Navbar';
import RetroOverlay from './components/RetroOverlay';
import { playCoinSound, playLaserSound, playSelectSound, playBuzzerSound } from './utils/audio';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

function TodoItem() {
  const [todo, setTodo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Editing States
  const [editMode, setEditMode] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPriority, setEditPriority] = useState('MEDIUM');
  const [editDueDate, setEditDueDate] = useState('');
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (id) {
      fetchTodoDetails(id);
    } else {
      setError('NO TODO ID DETECTED IN LOG.');
      setLoading(false);
      playBuzzerSound();
    }
  }, []);

  const fetchTodoDetails = async (id) => {
    try {
      const response = await fetch(`${API_URL}/todos/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('TODO DATA GONE (404)');
        }
        throw new Error('TRANSMISSION FAILURE');
      }
      const data = await response.json();
      setTodo(data);
      
      // Initialize edit fields
      setEditTitle(data.title);
      setEditDescription(data.description || '');
      setEditPriority(data.priority || 'MEDIUM');
      setEditDueDate(data.dueDate ? data.dueDate.substring(0, 10) : '');
    } catch (err) {
      setError(err.message);
      playBuzzerSound();
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    const isNowCompleted = !todo.completed;
    const xpValues = { LOW: 10, MEDIUM: 20, HIGH: 50, BOSS: 100 };
    const xpReward = xpValues[todo.priority] || 20;
    const currentXP = parseInt(localStorage.getItem('playerXP') || '0', 10);

    try {
      const response = await fetch(`${API_URL}/todos/${todo.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completed: isNowCompleted }),
      });
      
      if (!response.ok) throw new Error('Toggle failed');
      const data = await response.json();
      setTodo(data);

      // Adjust Gamification State
      let newXP = currentXP;
      if (isNowCompleted) {
        newXP += xpReward;
        
        // Trigger Level-Up Check
        const oldLvl = Math.floor(currentXP / 100) + 1;
        const newLvl = Math.floor(newXP / 100) + 1;
        if (newLvl > oldLvl) {
          import('./utils/audio').then(a => a.playLevelUpSound());
        } else {
          playCoinSound();
        }
      } else {
        newXP = Math.max(0, currentXP - xpReward);
        playLaserSound();
      }

      localStorage.setItem('playerXP', newXP.toString());
      window.dispatchEvent(new Event('playerStatsChanged'));
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    // Form Validation Checks
    if (!editTitle.trim()) {
      setValidationError('TODO TITLE IS EMPTY! WRITE SOMETHING.');
      playBuzzerSound();
      return;
    }
    if (editTitle.length > 100) {
      setValidationError('TITLE EXCEEDS 100 CHARACTERS.');
      playBuzzerSound();
      return;
    }
    if (editDescription.length > 500) {
      setValidationError('DESCRIPTION EXCEEDS 500 CHARACTERS.');
      playBuzzerSound();
      return;
    }

    try {
      const response = await fetch(`${API_URL}/todos/${todo.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: editTitle.trim(),
          description: editDescription.trim(),
          priority: editPriority,
          dueDate: editDueDate ? new Date(editDueDate).toISOString() : null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Server rejected changes');
      }

      const updatedData = await response.json();
      setTodo(updatedData);
      setEditMode(false);
      playCoinSound();
    } catch (err) {
      setValidationError(err.message);
      playBuzzerSound();
    }
  };

  const handleToggleEditMode = () => {
    playSelectSound();
    setEditMode(!editMode);
    setValidationError('');
  };

  const isOverdue = (dueDate, completed) => {
    if (!dueDate || completed) return false;
    const today = new Date();
    today.setHours(0,0,0,0);
    const due = new Date(dueDate);
    due.setHours(0,0,0,0);
    return due < today;
  };

  if (loading) {
    return (
      <div className="container">
        <RetroOverlay />
        <div className="game-state-screen" style={{ borderStyle: 'solid' }}>
          <p className="player-name" style={{ fontSize: '1.5rem', animation: 'blink 1s infinite alternate' }}>ACCESSING TODO MEMORY BLOCK... ⏳</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <RetroOverlay />
        <Navbar activePage="home" />
        <div className="game-state-screen">
          <p className="offline-title">ERROR: TODO NOT FOUND</p>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>{error}</p>
          <a href="/" className="back-link" style={{ marginBottom: 0 }}>← ABORT AND GO HOME</a>
        </div>
      </div>
    );
  }

  if (!todo) return null;

  const overdue = isOverdue(todo.dueDate, todo.completed);

  return (
    <div className="container">
      <RetroOverlay />
      <Navbar activePage="home" />

      <a href="/" className="back-link">← RETURN TO LOG</a>

      {editMode ? (
        <form onSubmit={handleEditSubmit} className="form-group" style={{ marginTop: '1.5rem' }}>
          <h2 style={{ fontSize: '1.4rem', textShadow: '2px 2px 0 var(--primary)' }}>EDITING TODO DATA</h2>
          
          {validationError && (
            <div style={{ color: '#ff3838', fontSize: '1rem', border: '2px solid #ff3838', padding: '1rem', borderRadius: '8px', background: 'rgba(255,56,56,0.1)' }}>
              ⚠️ ERROR: {validationError}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label>Todo Title</label>
            <input 
              type="text" 
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="What needs to be done? ⚔️"
              maxLength={100}
              required
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label>Todo Description</label>
            <textarea 
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="Add details, hints, or instructions... 📜"
              maxLength={500}
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1 }}>
              <label>Difficulty / Priority</label>
              <select value={editPriority} onChange={(e) => setEditPriority(e.target.value)}>
                <option value="LOW">CHILL 🧊 (10 XP)</option>
                <option value="MEDIUM">NORMAL 🎈 (20 XP)</option>
                <option value="HIGH">HIGH ENERGY 🔥 (50 XP)</option>
                <option value="BOSS">SUPER BOSS 🚨 (100 XP)</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1 }}>
              <label>Target Deadline (Due Date)</label>
              <input 
                type="date" 
                value={editDueDate}
                onChange={(e) => setEditDueDate(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button type="submit" className="btn-secondary" style={{ flex: 1 }}>SAVE PROTOCOLS 💾</button>
            <button type="button" className="btn-danger" onClick={handleToggleEditMode} style={{ flex: 1 }}>ABORT CHANGES ❌</button>
          </div>
        </form>
      ) : (
        <div className="todo-details-card" style={{ borderColor: overdue ? '#ff3838' : 'var(--border-color)' }}>
          <h1 style={{ fontSize: '2rem', textAlign: 'left', wordBreak: 'break-word', marginTop: 0 }}>{todo.title}</h1>
          
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
            <span className="badge" style={{ 
              backgroundColor: todo.completed ? 'rgba(57, 255, 20, 0.15)' : 'rgba(255, 0, 127, 0.15)',
              borderColor: todo.completed ? 'var(--accent)' : 'var(--primary)',
              color: todo.completed ? 'var(--accent)' : 'var(--primary)',
            }}>
              {todo.completed ? 'COMPLETED 🌟' : 'UNDERWAY 🛠️'}
            </span>

            <span className={`badge badge-${todo.priority}`}>
              DIFFICULTY: {todo.priority === 'LOW' ? 'Chill 🧊 (+10 XP)' : todo.priority === 'HIGH' ? 'High 🔥 (+50 XP)' : todo.priority === 'BOSS' ? 'SUPER BOSS 🚨 (+100 XP)' : 'Normal 🎈 (+20 XP)'}
            </span>

            {todo.dueDate && (
              <span className={`badge ${overdue ? 'badge-overdue' : 'badge-LOW'}`}>
                {overdue ? 'OVERDUE DEADLINE ⚠️ ' : 'DEADLINE: '}
                {new Date(todo.dueDate).toLocaleDateString()}
              </span>
            )}
          </div>

          <div style={{ 
            marginBottom: '2rem', 
            fontSize: '1.2rem', 
            color: 'var(--text-main)', 
            textAlign: 'left', 
            backgroundColor: 'var(--bg-color)', 
            padding: '1.5rem', 
            borderRadius: '8px',
            border: '2px solid var(--border-color)',
            minHeight: '80px',
            wordBreak: 'break-word',
            whiteSpace: 'pre-wrap'
          }}>
            <strong style={{ color: 'var(--secondary)', display: 'block', marginBottom: '0.8rem', fontSize: '0.9rem', fontFamily: "'Press Start 2P'" }}>TODO DETAILS 📜:</strong> 
            {todo.description || 'No detailed instructions provided... Just execute with maximum effort! 💪'}
          </div>

          <div style={{ marginBottom: '2.5rem', fontSize: '0.9rem', color: 'var(--text-muted)', textAlign: 'left', borderTop: '2px dashed var(--border-color)', paddingTop: '1rem' }}>
            <div><strong>INITIALIZED:</strong> {new Date(todo.createdAt).toLocaleString()} ⏱️</div>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            <button onClick={handleToggleStatus} style={{ flex: 1 }}>
              {todo.completed ? 'RESET TODO ⏪' : 'COMPLETE TODO 🏆'}
            </button>
            <button className="btn-secondary" onClick={handleToggleEditMode} style={{ flex: 1 }}>
              REPROGRAM DATA ✏️
            </button>
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
    <TodoItem />
  </React.StrictMode>
);
