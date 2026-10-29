/**
 * server.js — Task Management API (Blue-Green Deployment)
 * Week 12: Blue-Green Deployment Simulation with Docker Compose
 * Author: Aayush Kathiriya
 *
 * Key addition over W11:
 *   GET /version  — returns the VERSION environment variable so traffic
 *                   switching between blue and green can be verified at runtime.
 */

const express   = require('express');
const http      = require('http');
const NodeCache = require('node-cache');

const app   = express();
const cache = new NodeCache({ stdTTL: 120, checkperiod: 30 });

// Read deployment colour from environment (set in docker-compose.yml)
const VERSION = process.env.VERSION || 'unknown';
const PORT    = process.env.PORT    || 5000;

// ── 1. Body Parsers ──────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ── 2. Request Logger ────────────────────────────────────────────────────────
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const ms = Date.now() - start;
    console.log(`[${VERSION.toUpperCase()}] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${ms}ms)`);
  });
  next();
});

// ── 3. Security Headers ──────────────────────────────────────────────────────
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('X-API-Version', '4.0.0');
  res.setHeader('X-Deployment-Colour', VERSION);   // visible in response headers
  next();
});

// ── 4. Routes ────────────────────────────────────────────────────────────────
const taskRoutes = require('./routes/tasks');
app.use('/tasks', taskRoutes(cache));

// ── 5. /version Endpoint (Blue-Green verification) ────────────────────────────
// Returns the deployment colour so curl can confirm which container is serving.
app.get('/version', (req, res) => {
  res.status(200).json({
    version:    VERSION,
    colour:     VERSION,
    port:       PORT,
    pid:        process.pid,
    node:       process.version,
    uptime_s:   Math.floor(process.uptime()),
    timestamp:  new Date().toISOString(),
    message:    `Task Management API — ${VERSION.toUpperCase()} deployment is active`,
  });
});

// ── 6. Root Info ──────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.status(200).json({
    name:    'Task Management REST API',
    version: '4.0.0',
    week:    12,
    deployment: {
      colour:   VERSION,
      strategy: 'Blue-Green',
      port:     PORT,
    },
    endpoints: {
      'GET  /version':     'Deployment colour verification endpoint',
      'GET  /tasks':       'Retrieve all tasks (cached)',
      'POST /tasks':       'Create a new task',
      'GET  /tasks/:id':   'Retrieve a single task',
      'PUT  /tasks/:id':   'Fully replace a task',
      'PATCH /tasks/:id':  'Partially update a task',
      'DELETE /tasks/:id': 'Delete a task',
    },
  });
});

// ── 7. Cache Status & Flush ───────────────────────────────────────────────────
app.get('/cache/status', (req, res) => {
  const stats = cache.getStats();
  res.status(200).json({ success: true, deployment: VERSION, cache: stats });
});

app.delete('/cache', (req, res) => {
  cache.flushAll();
  res.status(200).json({ success: true, message: 'Cache flushed.', deployment: VERSION });
});

// ── 8. 404 & Error Handlers ───────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route '${req.originalUrl}' not found.`, deployment: VERSION });
});

app.use((err, req, res, next) => {
  console.error(`[${VERSION.toUpperCase()}] ERROR:`, err.stack);
  res.status(500).json({ success: false, message: 'Internal Server Error.', deployment: VERSION });
});

// ── 9. Start Server ───────────────────────────────────────────────────────────
http.createServer(app).listen(PORT, () => {
  console.log(`\n╔═══════════════════════════════════════════════════╗`);
  console.log(`║  Task Management API — ${VERSION.toUpperCase()} DEPLOYMENT            ║`);
  console.log(`╠═══════════════════════════════════════════════════╣`);
  console.log(`║  Port   : ${PORT}                                    ║`);
  console.log(`║  Colour : ${VERSION}                                  ║`);
  console.log(`║  Cache  : node-cache (TTL=120s)                   ║`);
  console.log(`╚═══════════════════════════════════════════════════╝\n`);
});
