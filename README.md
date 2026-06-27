# Multi-Page Todo Application

This repository contains a full-stack Todo application built with React (Vite MPA) for the frontend and Node.js (Express) for the backend.

## Features Documented

### Frontend (React + Vite)
- **Multi-Page Application Architecture:** Instead of a traditional Single Page Application (SPA) using React Router, this app utilizes Vite's multi-page build configuration. It serves `index.html` for the Todo List and `todo.html` for the Single Todo Item view.
- **Todo List Page (`/`):**
  - Displays a list of all current todos fetched from the backend API.
  - Allows users to add a new todo with a title and optional description.
  - Supports marking a todo as complete/incomplete via a checkbox.
  - Supports deleting a todo.
  - Clicking on a todo item navigates to the Single Todo Item page.
- **Single Todo Item Page (`/todo.html?id=<TODO_ID>`):**
  - Retrieves the `id` from the URL query parameter to fetch and display the specific todo details.
  - Displays the full title, completion status, description, and creation timestamp.
  - Allows toggling the completion status directly from this page.
  - Provides a back button to return to the main list.
- **Modern UI/UX:** Styled using custom vanilla CSS with a responsive dark-mode theme, hover effects, and transitions to ensure a premium feel.

### Backend (Node.js + Express)
- **RESTful API:** Provides standard CRUD endpoints for managing todos.
  - `GET /api/todos`: Fetch all todos.
  - `GET /api/todos/:id`: Fetch a single todo by its ID.
  - `POST /api/todos`: Create a new todo.
  - `PUT /api/todos/:id`: Update an existing todo (e.g., mark as completed).
  - `DELETE /api/todos/:id`: Delete a todo.
- **File-Based Storage:** Persists data locally in a `todos.json` file using Node's native `fs` module, ensuring data remains available across server restarts.
- **CORS Enabled:** Fully configured to accept requests from the frontend application.

## How to Run

### 1. Start the Backend
```bash
cd backend
npm install
node server.js
```
The backend will run on `http://localhost:3000`.

### 2. Start the Frontend
In a new terminal instance:
```bash
cd frontend
npm install
npm run dev
```
The frontend will start a development server (typically on `http://localhost:5173`).

Navigate to the provided Vite local URL to use the application!
