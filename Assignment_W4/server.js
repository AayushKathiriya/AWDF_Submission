/**
 * server.js — Task Management API Entry Point
 * Week 4 Assignment: Richardson Maturity Model
 * Author: Aayush Kathiriya
 */

const express = require('express');
const app = express();

// ── Middleware ──────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ── API Info Header ─────────────────────────────
app.use((req, res, next) => {
  res.setHeader('X-API-Version', '1.0.0');
  res.setHeader('X-RMM-Level', '2'); // Richardson Maturity Model Level
  next();
});

// ── Routes ──────────────────────────────────────
const taskRoutes = require('./routes/tasks');
app.use('/tasks', taskRoutes);

// ── Root endpoint ────────────────────────────────
app.get('/', (req, res) => {
  res.status(200).json({
    name: 'Task Management REST API',
    version: '1.0.0',
    rmm_level: 2,
    description: 'A Level-2 RESTful API for managing tasks, built for ITUE301 Week 4.',
    endpoints: {
      'GET    /tasks':        'Retrieve all tasks (supports ?status= filter)',
      'POST   /tasks':        'Create a new task',
      'GET    /tasks/:id':    'Retrieve a single task by ID',
      'PUT    /tasks/:id':    'Fully replace a task',
      'PATCH  /tasks/:id':    'Partially update a task',
      'DELETE /tasks/:id':    'Delete a task',
    },
  });
});

// ── 404 Fallback ─────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route '${req.originalUrl}' not found.` });
});

// ── Global Error Handler ──────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal Server Error.' });
});

// ── Start Server ──────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🚀 Task Management API running on http://localhost:${PORT}`);
  console.log(`📋 Richardson Maturity Level: 2`);
  console.log(`📁 Endpoints: GET/POST /tasks | GET/PUT/PATCH/DELETE /tasks/:id\n`);
});

module.exports = app;
