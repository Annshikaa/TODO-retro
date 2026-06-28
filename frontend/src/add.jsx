import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import Navbar from './components/Navbar';
import RetroOverlay from './components/RetroOverlay';
import { playCoinSound, playBuzzerSound } from './utils/audio';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

function AddTodo() {
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [dueDate, setDueDate] = useState('');
  const [validationError, setValidationError] = useState('');

  const handleAddTodo = async (e) => {
    e.preventDefault();
    setValidationError('');

    // Validations
    if (!newTitle.trim()) {
      setValidationError('TODO TITLE IS EMPTY! WRITE SOMETHING.');
      playBuzzerSound();
      return;
    }
    if (newTitle.length > 100) {
      setValidationError('TITLE EXCEEDS 100 CHARACTERS.');
      playBuzzerSound();
      return;
    }
    if (newDescription.length > 500) {
      setValidationError('DESCRIPTION EXCEEDS 500 CHARACTERS.');
      playBuzzerSound();
      return;
    }

    try {
      const response = await fetch(`${API_URL}/todos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          title: newTitle.trim(), 
          description: newDescription.trim(), 
          priority,
          dueDate: dueDate ? new Date(dueDate).toISOString() : null
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Server rejected request');
      }

      playCoinSound();
      // Wait for sound to play a bit
      setTimeout(() => {
        window.location.href = '/';
      }, 200);
    } catch (error) {
      setValidationError(error.message);
      playBuzzerSound();
    }
  };

  return (
    <div className="container">
      <RetroOverlay />
      <Navbar activePage="add" />
      
      <h1>CREATE NEW TODO 🪄</h1>
      
      <form onSubmit={handleAddTodo} className="form-group" style={{ marginTop: '1.5rem' }}>
        {validationError && (
          <div style={{ color: '#ff3838', fontSize: '1rem', border: '2px solid #ff3838', padding: '1rem', borderRadius: '8px', background: 'rgba(255,56,56,0.1)' }}>
            ⚠️ ERROR: {validationError}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <label htmlFor="todo-title">Todo Title</label>
          <input 
            id="todo-title"
            type="text" 
            placeholder="What's your next big goal? ✨" 
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            maxLength={100}
            required
          />
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'right' }}>
            {newTitle.length}/100
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <label htmlFor="todo-description">Todo Details (Instructions)</label>
          <textarea 
            id="todo-description"
            placeholder="Any secret details? Tips, references, coordinates? (Optional) 🤫" 
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            maxLength={500}
          />
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'right' }}>
            {newDescription.length}/500
          </span>
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1 }}>
            <label htmlFor="todo-priority">Task Priority</label>
            <select 
              id="todo-priority"
              value={priority} 
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="LOW">CHILL 🧊 (+10 XP)</option>
              <option value="MEDIUM">NORMAL 🎈 (+20 XP)</option>
              <option value="HIGH">HIGH ENERGY 🔥 (+50 XP)</option>
              <option value="BOSS">SUPER BOSS FIGHT 🚨 (+100 XP)</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1 }}>
            <label htmlFor="todo-duedate">Target Deadline (Optional)</label>
            <input 
              id="todo-duedate"
              type="date" 
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </div>

        <button type="submit" style={{ marginTop: '1rem' }}>
          CREATE TODO 🚀
        </button>
      </form>
    </div>
  );
}

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <AddTodo />
  </React.StrictMode>
);
