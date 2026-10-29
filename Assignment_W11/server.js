/**
 * server.js — Task Management API (Performance + Caching)
 * Week 9: Performance Load Testing with Apache Bench
 * Author: Aayush Kathiriya
 *
 * Features applied:
 *   1. In-memory node-cache         — GET /tasks response caching (TTL = 120s)
 *   2. Security headers             — X-Content-Type-Options, X-Frame-Options, etc.
 *   3. Request logging              — method, url, status, duration on every request
 *   4. Cache-Control response header — informs HTTP clients of caching strategy
 */

const express   = require('express');
const http      = require('http');
const NodeCache = require('node-cache');

const app   = express();
const cache = new NodeCache({ stdTTL: 120, checkperiod: 30 });

// ── 1. Body Parsers ──────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ── 2. Request Logger ────────────────────────────────────────────────────────
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const ms = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${ms}ms)`);
  });
  next();
});

// ── 3. Security Headers ──────────────────────────────────────────────────────
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('X-API-Version', '3.0.0');
  next();
});

// ── 4. Routes ────────────────────────────────────────────────────────────────
const taskRoutes = require('./routes/tasks');
app.use('/tasks', taskRoutes(cache));

// ── 5. Root Info ──────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.status(200).json({
    name: 'Task Management REST API',
    version: '3.0.0',
    week: 9,
    caching: {
      engine: 'node-cache (in-memory)',
      ttl_seconds: 120,
      cached_routes: ['GET /tasks'],
    },
    endpoints: {
      'GET    /tasks':        'Retrieve all tasks (cached)',
      'POST   /tasks':        'Create a new task (invalidates cache)',
      'GET    /tasks/:id':    'Retrieve a single task',
      'PUT    /tasks/:id':    'Fully replace a task (invalidates cache)',
      'PATCH  /tasks/:id':    'Partially update a task (invalidates cache)',
      'DELETE /tasks/:id':    'Delete a task (invalidates cache)',
      'GET    /cache/status': 'Cache hit/miss statistics',
      'DELETE /cache':        'Manually flush cache',
    },
  });
});

// ── 6. Cache Status & Flush Routes ───────────────────────────────────────────
app.get('/cache/status', (req, res) => {
  const stats = cache.getStats();
  res.status(200).json({
    success: true,
    cache: {
      hits:   stats.hits,
      misses: stats.misses,
      keys:   cache.keys(),
      ksize:  stats.ksize,
      vsize:  stats.vsize,
    },
  });
});

app.delete('/cache', (req, res) => {
  cache.flushAll();
  res.status(200).json({ success: true, message: 'Cache flushed.' });
});

// ── 7. 404 & Error Handlers ───────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route '${req.originalUrl}' not found.` });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal Server Error.' });
});

// ── 8. Start Server ───────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
http.createServer(app).listen(PORT, () => {
  console.log(`\n[INFO]  Task Management API (Week 9) running on http://localhost:${PORT}`);
  console.log(`[INFO]  Cache TTL: 120s | Engine: node-cache (in-memory)`);
  console.log(`[INFO]  Load test target: http://localhost:${PORT}/tasks\n`);
});
