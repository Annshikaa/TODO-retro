import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

const API_URL = 'http://localhost:3000/api/todos';

function TodoItem() {
  const [todo, setTodo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Extract ID from query parameters
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (id) {
      fetchTodoDetails(id);
    } else {
      setError('No Todo ID provided in the URL query parameters.');
      setLoading(false);
    }
  }, []);

  const fetchTodoDetails = async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}`);
      if (!response.ok) {
        throw new Error('Todo not found');
      }
      const data = await response.json();
      setTodo(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async () => {
    try {
      const response = await fetch(`${API_URL}/${todo.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completed: !todo.completed }),
      });
      const data = await response.json();
      setTodo(data);
    } catch (err) {
      console.error('Error updating todo:', err);
    }
  };

  if (loading) return <div className="container"><p>Loading...</p></div>;
  if (error) return <div className="container"><a href="/" className="back-link">← Back to list</a><p style={{ color: '#ff4a4a' }}>Error: {error}</p></div>;
  if (!todo) return null;

  return (
    <div className="container">
      <a href="/" className="back-link">← Back to Todos List</a>
      
      <div className="todo-details-card">
        <h1 style={{ textAlign: 'left', marginTop: 0, fontSize: '2.5rem' }}>{todo.title}</h1>
        
        <div style={{ marginBottom: '2rem' }}>
          <span style={{ 
            padding: '0.4rem 0.8rem', 
            borderRadius: '20px', 
            fontSize: '0.9rem',
            fontWeight: 'bold',
            backgroundColor: todo.completed ? '#28a745' : '#ffc107',
            color: todo.completed ? 'white' : 'black'
          }}>
            {todo.completed ? 'Completed' : 'Pending'}
          </span>
        </div>

        <div style={{ marginBottom: '2rem', fontSize: '1.2rem', color: '#ccc' }}>
          <strong>Description:</strong> 
          <p>{todo.description || 'No description provided.'}</p>
        </div>

        <div style={{ marginBottom: '2rem', fontSize: '0.9rem', color: '#888' }}>
          <strong>Created At:</strong> {new Date(todo.createdAt).toLocaleString()}
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={toggleStatus} style={{ backgroundColor: '#646cff', color: 'white' }}>
            Mark as {todo.completed ? 'Pending' : 'Completed'}
          </button>
        </div>
      </div>
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
