import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

const API_URL = 'http://localhost:3000/api/todos';

function TodoList() {
  const [todos, setTodos] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setTodos(data);
    } catch (error) {
      console.error('Error fetching todos:', error);
    }
  };

  const handleAddTodo = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: newTitle, description: newDescription }),
      });
      const data = await response.json();
      setTodos([...todos, data]);
      setNewTitle('');
      setNewDescription('');
    } catch (error) {
      console.error('Error adding todo:', error);
    }
  };

  const toggleTodo = async (id, currentStatus) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completed: !currentStatus }),
      });
      const data = await response.json();
      setTodos(todos.map(t => t.id === id ? data : t));
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  };

  const deleteTodo = async (id, e) => {
    e.stopPropagation();
    try {
      await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });
      setTodos(todos.filter(t => t.id !== id));
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  return (
    <div className="container">
      <h1>My Todos</h1>
      
      <form onSubmit={handleAddTodo} className="form-group">
        <input 
          type="text" 
          placeholder="What needs to be done?" 
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
        />
        <input 
          type="text" 
          placeholder="Description (optional)" 
          value={newDescription}
          onChange={(e) => setNewDescription(e.target.value)}
        />
        <button type="submit">Add Todo</button>
      </form>

      <div className="todo-list">
        {todos.map(todo => (
          <div key={todo.id} className="todo-item" onClick={() => window.location.href = `/todo.html?id=${todo.id}`}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <input 
                type="checkbox" 
                checked={todo.completed}
                onChange={(e) => {
                  e.stopPropagation();
                  toggleTodo(todo.id, todo.completed);
                }}
                onClick={(e) => e.stopPropagation()}
                style={{ width: '1.5rem', height: '1.5rem' }}
              />
              <span className={`todo-title ${todo.completed ? 'todo-completed' : ''}`}>
                {todo.title}
              </span>
            </div>
            <button className="delete-btn" onClick={(e) => deleteTodo(todo.id, e)}>
              Delete
            </button>
          </div>
        ))}
        {todos.length === 0 && <p style={{ textAlign: 'center' }}>No todos yet. Add one above!</p>}
      </div>
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
