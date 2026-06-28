require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Security and Logging
app.use(helmet());
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

// Database connection
const dbPath = path.resolve(__dirname, process.env.DATABASE_URL || 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log(`Connected to SQLite database at ${dbPath}`);
    db.serialize(() => {
      // Table Creation
      db.run(`
        CREATE TABLE IF NOT EXISTS todos (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          description TEXT,
          completed INTEGER DEFAULT 0,
          createdAt TEXT,
          priority TEXT DEFAULT 'MEDIUM',
          dueDate TEXT
        )
      `);
      
      // Migrations for older schemas
      db.run(`ALTER TABLE todos ADD COLUMN priority TEXT DEFAULT 'MEDIUM'`, (err) => {
        // Ignore column already exists errors
      });
      
      db.run(`ALTER TABLE todos ADD COLUMN dueDate TEXT`, (err) => {
        // Ignore column already exists errors
      });
    });
  }
});

// Helper for validating ISO dates
const isValidISODate = (dateStr) => {
  if (!dateStr) return true; // Optional
  const d = new Date(dateStr);
  return !isNaN(d.getTime()) && dateStr.includes('T');
};

// Priority Enum check
const VALID_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'BOSS'];

// Input validation middlewares
const validateCreateTodo = (req, res, next) => {
  const { title, description, priority, dueDate } = req.body;
  
  if (!title || typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ error: 'Title is required and must be a non-empty string.' });
  }
  if (title.length > 100) {
    return res.status(400).json({ error: 'Title must be under 100 characters.' });
  }
  if (description !== undefined && typeof description !== 'string') {
    return res.status(400).json({ error: 'Description must be a string.' });
  }
  if (description && description.length > 500) {
    return res.status(400).json({ error: 'Description must be under 500 characters.' });
  }
  if (priority && !VALID_PRIORITIES.includes(priority)) {
    return res.status(400).json({ error: `Priority must be one of: ${VALID_PRIORITIES.join(', ')}` });
  }
  if (dueDate && !isValidISODate(dueDate)) {
    return res.status(400).json({ error: 'dueDate must be a valid ISO 8601 date string.' });
  }
  
  next();
};

const validateUpdateTodo = (req, res, next) => {
  const { title, description, priority, completed, dueDate } = req.body;
  
  if (title !== undefined) {
    if (typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ error: 'Title must be a non-empty string.' });
    }
    if (title.length > 100) {
      return res.status(400).json({ error: 'Title must be under 100 characters.' });
    }
  }
  if (description !== undefined) {
    if (typeof description !== 'string') {
      return res.status(400).json({ error: 'Description must be a string.' });
    }
    if (description && description.length > 500) {
      return res.status(400).json({ error: 'Description must be under 500 characters.' });
    }
  }
  if (priority !== undefined && !VALID_PRIORITIES.includes(priority)) {
    return res.status(400).json({ error: `Priority must be one of: ${VALID_PRIORITIES.join(', ')}` });
  }
  if (completed !== undefined && typeof completed !== 'boolean') {
    return res.status(400).json({ error: 'Completed must be a boolean value.' });
  }
  if (dueDate !== undefined && dueDate !== null && !isValidISODate(dueDate)) {
    return res.status(400).json({ error: 'dueDate must be a valid ISO 8601 date string or null.' });
  }
  
  next();
};

// --- API ROUTES ---

// GET all todos
app.get('/api/todos', (req, res, next) => {
  db.all('SELECT * FROM todos ORDER BY createdAt DESC', [], (err, rows) => {
    if (err) return next(err);
    
    // Map database integer representing boolean to actual boolean values
    const todos = rows.map(r => ({
      ...r,
      completed: !!r.completed,
      dueDate: r.dueDate || null
    }));
    res.json(todos);
  });
});

// GET single todo by id
app.get('/api/todos/:id', (req, res, next) => {
  db.get('SELECT * FROM todos WHERE id = ?', [req.params.id], (err, row) => {
    if (err) return next(err);
    
    if (row) {
      row.completed = !!row.completed;
      row.dueDate = row.dueDate || null;
      res.json(row);
    } else {
      res.status(404).json({ error: 'Todo item not found.' });
    }
  });
});

// CREATE new todo
app.post('/api/todos', validateCreateTodo, (req, res, next) => {
  const { title, description, priority, dueDate } = req.body;
  
  const newTodo = {
    id: Date.now().toString(),
    title: title.trim(),
    description: description ? description.trim() : '',
    completed: 0,
    createdAt: new Date().toISOString(),
    priority: priority || 'MEDIUM',
    dueDate: dueDate || null
  };
  
  const sql = 'INSERT INTO todos (id, title, description, completed, createdAt, priority, dueDate) VALUES (?, ?, ?, ?, ?, ?, ?)';
  const params = [
    newTodo.id,
    newTodo.title,
    newTodo.description,
    newTodo.completed,
    newTodo.createdAt,
    newTodo.priority,
    newTodo.dueDate
  ];
  
  db.run(sql, params, function (err) {
    if (err) return next(err);
    newTodo.completed = !!newTodo.completed;
    res.status(201).json(newTodo);
  });
});

// UPDATE a todo
app.put('/api/todos/:id', validateUpdateTodo, (req, res, next) => {
  db.get('SELECT * FROM todos WHERE id = ?', [req.params.id], (err, row) => {
    if (err) return next(err);
    if (!row) {
      return res.status(404).json({ error: 'Todo item not found.' });
    }
    
    const completed = req.body.completed !== undefined ? (req.body.completed ? 1 : 0) : row.completed;
    const title = req.body.title !== undefined ? req.body.title.trim() : row.title;
    const description = req.body.description !== undefined ? req.body.description.trim() : row.description;
    const priority = req.body.priority !== undefined ? req.body.priority : row.priority;
    const dueDate = req.body.dueDate !== undefined ? req.body.dueDate : row.dueDate;
    
    db.run(
      'UPDATE todos SET title = ?, description = ?, completed = ?, priority = ?, dueDate = ? WHERE id = ?', 
      [title, description, completed, priority, dueDate, req.params.id], 
      function (err) {
        if (err) return next(err);
        res.json({
          id: req.params.id,
          title,
          description,
          completed: !!completed,
          createdAt: row.createdAt,
          priority,
          dueDate: dueDate || null
        });
      }
    );
  });
});

// DELETE a todo
app.delete('/api/todos/:id', (req, res, next) => {
  db.run('DELETE FROM todos WHERE id = ?', [req.params.id], function (err) {
    if (err) return next(err);
    
    if (this.changes > 0) {
      res.status(204).send();
    } else {
      res.status(404).json({ error: 'Todo item not found.' });
    }
  });
});

// Centralized Error Handler Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ error: 'An unexpected internal server error occurred.' });
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
