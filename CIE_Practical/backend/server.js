/**
 * server.js — CIE Practical Backend Server
 * Advanced Web Development Frameworks (ITUE301) — CIE Practical Exam
 * Author: Aayush Kathiriya
 *
 * Implements:
 *   T3: RESTful API + Middleware (5 working endpoints at /api/v1/, requestLogger, authGuard, errorHandler)
 *   T5: MongoDB + Schema Validation (3 models, .populate(), clean 400 validation error formatting)
 */

require('dotenv').config();
const express       = require('express');
const http          = require('http');
const cors          = require('cors');
const connectDB     = require('./config/db');
const requestLogger = require('./middleware/requestLogger');
const errorHandler  = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

// ── 1. Core Middleware ────────────────────────────────────────────────────────
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ── 2. Custom Middleware: requestLogger (T3) ──────────────────────────────────
app.use(requestLogger);

// ── 3. Health & API Info ──────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'ONLINE',
    project: 'CIE Practical Exam — Task Management System',
    author: 'Aayush Kathiriya',
    version: '1.0.0',
    endpoints: {
      'POST /api/v1/auth/login': 'User authentication (returns JWT)',
      'POST /api/v1/auth/register': 'Register user (validates User schema)',
      'GET  /api/v1/tasks': 'List all tasks (populates assignedTo and project)',
      'GET  /api/v1/tasks/:id': 'Get single task by ID (populated)',
      'POST /api/v1/tasks': 'Create new task (authGuard + 3-schema validation)',
      'PATCH /api/v1/tasks/:id/status': 'Update task status (authGuard + enum check)',
      'DELETE /api/v1/tasks/:id': 'Delete task (authGuard)',
      'GET  /api/v1/projects': 'Get active projects list',
      'GET  /api/v1/users': 'Get team users list',
    },
  });
});

// ── 4. API v1 Routes (T3) ─────────────────────────────────────────────────────
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1', taskRoutes);

// ── 5. 404 Route Handler ──────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'NotFound',
    message: `Cannot find route '${req.method} ${req.originalUrl}' on this server.`,
    availablePrefix: '/api/v1/',
  });
});

// ── 6. Global Error Handling Middleware (T3 & T5) ─────────────────────────────
app.use(errorHandler);

// ── 7. Server Initialization ──────────────────────────────────────────────────
http.createServer(app).listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`[CIE PRACTICAL] Server running on http://localhost:${PORT}`);
  console.log(`[CIE PRACTICAL] API Base: http://localhost:${PORT}/api/v1/`);
  console.log(`======================================================\n`);
});
