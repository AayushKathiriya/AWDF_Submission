/**
 * routes/tasks.js — Task Routes (Level 2 RESTful + Security Hardened)
 * Week 7: express-mongo-sanitize applied at middleware level (see server.js)
 * Routes themselves are unchanged from W4 — sanitization is global middleware.
 */

const express = require('express');
const router  = express.Router();
const {
  getAllTasks, getTaskById, createTask, replaceTask, updateTask, deleteTask,
} = require('../models/taskModel');

// ── HATEOAS _links builder ───────────────────────────────────────────────────
const buildLinks = (id) => ({
  self:   { href: `/tasks/${id}`, method: 'GET'    },
  update: { href: `/tasks/${id}`, method: 'PUT'    },
  patch:  { href: `/tasks/${id}`, method: 'PATCH'  },
  delete: { href: `/tasks/${id}`, method: 'DELETE' },
  all:    { href: '/tasks',       method: 'GET'    },
});

// ── Validation ───────────────────────────────────────────────────────────────
const VALID_STATUSES   = ['pending', 'in-progress', 'completed'];
const VALID_PRIORITIES = ['low', 'medium', 'high'];

const validate = (body, requireAll = true) => {
  const errors = [];
  if (requireAll && !body.title)      errors.push('title is required.');
  if (body.title    !== undefined && typeof body.title !== 'string') errors.push('title must be a string.');
  if (body.status   !== undefined && !VALID_STATUSES.includes(body.status))
    errors.push(`status must be one of: ${VALID_STATUSES.join(', ')}.`);
  if (body.priority !== undefined && !VALID_PRIORITIES.includes(body.priority))
    errors.push(`priority must be one of: ${VALID_PRIORITIES.join(', ')}.`);
  return errors;
};

// GET /tasks
router.get('/', (req, res) => {
  const { status } = req.query;
  const tasks  = getAllTasks();
  const result = status ? tasks.filter((t) => t.status === status) : tasks;
  return res.status(200).json({ success: true, count: result.length, data: result.map((t) => ({ ...t, _links: buildLinks(t.id) })) });
});

// GET /tasks/:id
router.get('/:id', (req, res) => {
  const task = getTaskById(req.params.id);
  if (!task) return res.status(404).json({ success: false, message: `Task '${req.params.id}' not found.` });
  return res.status(200).json({ success: true, data: { ...task, _links: buildLinks(task.id) } });
});

// POST /tasks
router.post('/', (req, res) => {
  const errors = validate(req.body, true);
  if (errors.length) return res.status(422).json({ success: false, message: 'Validation failed.', errors });
  const task = createTask(req.body);
  return res.status(201).location(`/tasks/${task.id}`).json({ success: true, data: { ...task, _links: buildLinks(task.id) } });
});

// PUT /tasks/:id
router.put('/:id', (req, res) => {
  const errors = validate(req.body, true);
  if (errors.length) return res.status(422).json({ success: false, message: 'Validation failed.', errors });
  const task = replaceTask(req.params.id, req.body);
  if (!task) return res.status(404).json({ success: false, message: `Task '${req.params.id}' not found.` });
  return res.status(200).json({ success: true, data: { ...task, _links: buildLinks(task.id) } });
});

// PATCH /tasks/:id
router.patch('/:id', (req, res) => {
  if (Object.keys(req.body).length === 0)
    return res.status(400).json({ success: false, message: 'Request body must not be empty for PATCH.' });
  const errors = validate(req.body, false);
  if (errors.length) return res.status(422).json({ success: false, message: 'Validation failed.', errors });
  const task = updateTask(req.params.id, req.body);
  if (!task) return res.status(404).json({ success: false, message: `Task '${req.params.id}' not found.` });
  return res.status(200).json({ success: true, data: { ...task, _links: buildLinks(task.id) } });
});

// DELETE /tasks/:id
router.delete('/:id', (req, res) => {
  const deleted = deleteTask(req.params.id);
  if (!deleted) return res.status(404).json({ success: false, message: `Task '${req.params.id}' not found.` });
  return res.status(204).send();
});

module.exports = router;
