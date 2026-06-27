const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'todos.json');

app.use(cors());
app.use(express.json());

// Helper function to read data
const readData = () => {
  if (!fs.existsSync(DATA_FILE)) {
    return [];
  }
  const data = fs.readFileSync(DATA_FILE, 'utf8');
  return JSON.parse(data);
};

// Helper function to write data
const writeData = (data) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
};

// Get all todos
app.get('/api/todos', (req, res) => {
  const todos = readData();
  res.json(todos);
});

// Get single todo by id
app.get('/api/todos/:id', (req, res) => {
  const todos = readData();
  const todo = todos.find(t => t.id === req.params.id);
  if (todo) {
    res.json(todo);
  } else {
    res.status(404).json({ error: 'Todo not found' });
  }
});

// Create new todo
app.post('/api/todos', (req, res) => {
  const todos = readData();
  const newTodo = {
    id: Date.now().toString(),
    title: req.body.title,
    description: req.body.description || '',
    completed: false,
    createdAt: new Date().toISOString()
  };
  todos.push(newTodo);
  writeData(todos);
  res.status(201).json(newTodo);
});

// Update a todo
app.put('/api/todos/:id', (req, res) => {
  const todos = readData();
  const index = todos.findIndex(t => t.id === req.params.id);
  if (index !== -1) {
    todos[index] = { ...todos[index], ...req.body };
    writeData(todos);
    res.json(todos[index]);
  } else {
    res.status(404).json({ error: 'Todo not found' });
  }
});

// Delete a todo
app.delete('/api/todos/:id', (req, res) => {
  let todos = readData();
  const initialLength = todos.length;
  todos = todos.filter(t => t.id !== req.params.id);
  if (todos.length < initialLength) {
    writeData(todos);
    res.status(204).send();
  } else {
    res.status(404).json({ error: 'Todo not found' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
