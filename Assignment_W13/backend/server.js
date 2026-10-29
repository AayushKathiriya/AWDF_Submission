/**
 * server.js — Task Management API + AI Design Suggestion Route
 * Week 13: AI-Assisted UI Customisation and Design
 * Author: Aayush Kathiriya
 *
 * New additions over W12:
 *   POST /api/ai/design-suggestion  — calls OpenAI (or returns a structured
 *                                     fallback) and returns UI design suggestions
 *                                     as JSON: { colors, fonts, layoutTip }
 */

const express   = require('express');
const http      = require('http');
const cors      = require('cors');
const NodeCache = require('node-cache');

const app   = express();
const cache = new NodeCache({ stdTTL: 120, checkperiod: 30 });

const PORT = process.env.PORT || 5000;

// ── 1. Body Parsers & CORS ───────────────────────────────────────────────────
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ── 2. Request Logger ────────────────────────────────────────────────────────
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () =>
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${Date.now() - start}ms)`)
  );
  next();
});

// ── 3. Security Headers ──────────────────────────────────────────────────────
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-API-Version', '5.0.0');
  next();
});

// ── 4. Task Routes ────────────────────────────────────────────────────────────
const taskRoutes = require('./routes/tasks');
app.use('/tasks', taskRoutes(cache));

// ── 5. AI Design Suggestion Route ─────────────────────────────────────────────
const aiRoutes = require('./routes/ai');
app.use('/api/ai', aiRoutes);

// ── 6. Root Info ──────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.status(200).json({
    name: 'Task Management API — Week 13',
    version: '5.0.0',
    endpoints: {
      'POST /api/ai/design-suggestion': 'Get AI-generated UI design suggestions',
      'GET  /tasks':                    'Retrieve all tasks (cached)',
      'POST /tasks':                    'Create a new task',
    },
  });
});

// ── 7. 404 & Error Handlers ───────────────────────────────────────────────────
app.use((req, res) =>
  res.status(404).json({ success: false, message: `Route '${req.originalUrl}' not found.` })
);
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal Server Error.' });
});

// ── 8. Start Server ───────────────────────────────────────────────────────────
http.createServer(app).listen(PORT, () => {
  console.log(`\n[W13] Task Management API running on http://localhost:${PORT}`);
  console.log(`[W13] AI Design Suggestion: POST http://localhost:${PORT}/api/ai/design-suggestion\n`);
});
