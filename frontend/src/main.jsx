import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import Navbar from './components/Navbar';
import RetroOverlay from './components/RetroOverlay';
import { playCoinSound, playLaserSound, playSelectSound } from './utils/audio';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

function TodoList() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [popups, setPopups] = useState([]);

  // Filter and sort states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, ACTIVE, COMPLETED
  const [priorityFilter, setPriorityFilter] = useState('ALL'); // ALL, LOW, MEDIUM, HIGH, BOSS
  const [sortBy, setSortBy] = useState('CREATED_DESC'); // CREATED_DESC, CREATED_ASC, DUE_ASC, PRIORITY_DESC

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    setLoading(true);
    setError(false);
    try {
      const response = await fetch(`${API_URL}/todos`);
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setTodos(data);
    } catch (err) {
      console.error('Error fetching todos:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTodo = async (id, currentStatus, priority, e) => {
    e.stopPropagation();
    
    // Calculate XP updates locally
    const isNowCompleted = !currentStatus;
    const xpValues = { LOW: 10, MEDIUM: 20, HIGH: 50, BOSS: 100 };
    const xpReward = xpValues[priority] || 20;
    const currentXP = parseInt(localStorage.getItem('playerXP') || '0', 10);
    
    try {
      const response = await fetch(`${API_URL}/todos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completed: isNowCompleted }),
      });
      if (!response.ok) throw new Error('Update failed');
      const data = await response.json();
      setTodos(todos.map(t => t.id === id ? data : t));

      // Gamification State Adjustment
      let newXP = currentXP;
      if (isNowCompleted) {
        newXP += xpReward;
        
        // Spawn floating XP particle
        const rect = e.target.getBoundingClientRect();
        const popupX = rect.left + window.scrollX;
        const popupY = rect.top + window.scrollY - 20;
        const newPopup = {
          id: Date.now(),
          text: `+${xpReward} XP`,
          x: popupX,
          y: popupY
        };
        setPopups(prev => [...prev, newPopup]);
        setTimeout(() => {
          setPopups(prev => prev.filter(p => p.id !== newPopup.id));
        }, 1200);

        // Sound effect (Coin / Level Up inside component event dispatch)
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
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  };

  const handleDeleteTodo = async (id, e) => {
    e.stopPropagation();
    playLaserSound();
    
    // Visual confirmation
    if (!window.confirm('DELETE THIS TODO FOR GOOD? 🧨')) return;

    try {
      const response = await fetch(`${API_URL}/todos/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Delete failed');
      
      // If deleted item was completed, we don't deduct XP.
      // If it was still active, we just remove it.
      setTodos(todos.filter(t => t.id !== id));
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  const handleCardClick = (id) => {
    playSelectSound();
    setTimeout(() => {
      window.location.href = `/todo.html?id=${id}`;
    }, 80);
  };

  // Check if a task is overdue
  const isOverdue = (dueDate, completed) => {
    if (!dueDate || completed) return false;
    const today = new Date();
    today.setHours(0,0,0,0);
    const due = new Date(dueDate);
    due.setHours(0,0,0,0);
    return due < today;
  };

  // --- Filtering & Sorting Logic ---
  const filteredTodos = todos
    .filter(todo => {
      // Search Title
      return todo.title.toLowerCase().includes(searchTerm.toLowerCase());
    })
    .filter(todo => {
      // Status filter
      if (statusFilter === 'ACTIVE') return !todo.completed;
      if (statusFilter === 'COMPLETED') return todo.completed;
      return true;
    })
    .filter(todo => {
      // Priority filter
      if (priorityFilter !== 'ALL') return todo.priority === priorityFilter;
      return true;
    });

  const sortedTodos = [...filteredTodos].sort((a, b) => {
    if (sortBy === 'CREATED_ASC') {
      return new Date(a.createdAt) - new Date(b.createdAt);
    }
    if (sortBy === 'CREATED_DESC') {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }
    if (sortBy === 'DUE_ASC') {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate) - new Date(b.dueDate);
    }
    if (sortBy === 'PRIORITY_DESC') {
      const priorityWeight = { BOSS: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
      const weightA = priorityWeight[a.priority] || 2;
      const weightB = priorityWeight[b.priority] || 2;
      return weightB - weightA;
    }
    return 0;
  });

  return (
    <div className="container">
      <RetroOverlay />
      
      {/* Floating XP numbers */}
      {popups.map(p => (
        <div key={p.id} className="xp-popup" style={{ left: p.x, top: p.y }}>
          {p.text}
        </div>
      ))}

      <Navbar activePage="home" />

      <h1>ACTIVE TODOS 📝</h1>

      {error ? (
        <div className="game-state-screen">
          <p className="offline-title">CRITICAL ERROR: SERVER DISCONNECTED</p>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Check backend power status and restart terminal. 🔌</p>
          <button className="btn-secondary" onClick={fetchTodos}>REBOOT CONNECTION 🔄</button>
        </div>
      ) : loading ? (
        <div className="game-state-screen" style={{ borderStyle: 'solid' }}>
          <p className="player-name" style={{ fontSize: '1.5rem', animation: 'blink 1s infinite alternate' }}>LOADING TODO LIST... ⏳</p>
        </div>
      ) : (
        <>
          <div className="dashboard-controls">
            {/* Search */}
            <input 
              type="text" 
              placeholder="SEARCH TODOS BY KEYWORD... 🔍"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-bar"
            />
            
            {/* Filters and Sorting */}
            <div className="filter-row">
              <div className="filter-group">
                <label>Status Filter</label>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="ALL">ALL STATUSES</option>
                  <option value="ACTIVE">ACTIVE ONLY</option>
                  <option value="COMPLETED">COMPLETED ONLY</option>
                </select>
              </div>

              <div className="filter-group">
                <label>Task Priority</label>
                <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
                  <option value="ALL">ALL PRIORITIES</option>
                  <option value="LOW">CHILL 🧊</option>
                  <option value="MEDIUM">NORMAL 🎈</option>
                  <option value="HIGH">HIGH ENERGY 🔥</option>
                  <option value="BOSS">SUPER BOSS 🚨</option>
                </select>
              </div>

              <div className="filter-group">
                <label>Sort Todos</label>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="CREATED_DESC">NEWEST CREATED</option>
                  <option value="CREATED_ASC">OLDEST CREATED</option>
                  <option value="DUE_ASC">SOONEST DUE DATE</option>
                  <option value="PRIORITY_DESC">HIGHEST PRIORITY</option>
                </select>
              </div>
            </div>
          </div>

          <div className="todo-list">
            {sortedTodos.map(todo => {
              const overdue = isOverdue(todo.dueDate, todo.completed);
              
              return (
                <div 
                  key={todo.id} 
                  className={`todo-item priority-${todo.priority}`} 
                  onClick={() => handleCardClick(todo.id)}
                  style={{ borderColor: overdue ? '#ff3838' : 'var(--border-color)' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexGrow: 1 }}>
                    <input 
                      type="checkbox" 
                      checked={todo.completed}
                      onChange={(e) => handleToggleTodo(todo.id, todo.completed, todo.priority, e)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <span className={`todo-title ${todo.completed ? 'todo-completed' : ''}`}>
                        {todo.title}
                      </span>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                        <span className={`badge badge-${todo.priority}`}>
                          {todo.priority === 'LOW' ? 'Chill 🧊' : todo.priority === 'HIGH' ? 'High Energy 🔥' : todo.priority === 'BOSS' ? 'BOSS FIGHT 🚨' : 'Normal 🎈'}
                        </span>
                        
                        {todo.dueDate && (
                          <span className={`badge ${overdue ? 'badge-overdue' : 'badge-LOW'}`}>
                            {overdue ? 'OVERDUE ⏰ ' : 'DUE: '}
                            {new Date(todo.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button className="btn-danger delete-btn" onClick={(e) => handleDeleteTodo(todo.id, e)}>
                    TRASH 🗑️
                  </button>
                </div>
              );
            })}
            
            {sortedTodos.length === 0 && (
              <div className="game-state-screen">
                <p className="player-name" style={{ color: 'var(--accent)' }}>ALL TODOS COMPLETED! 🎉</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No matching todos found in this sector. Add one to keep leveling!</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <TodoList />
  </React.StrictMode>
);
