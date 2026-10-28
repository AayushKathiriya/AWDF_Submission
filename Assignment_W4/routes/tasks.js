/**
 * Task Routes — Level 2 RESTful (Richardson Maturity Model)
 *
 * Level 2 Requirements:
 *   ✅ Unique resource URLs  (Level 1)
 *   ✅ Correct HTTP verbs    (GET, POST, PUT, PATCH, DELETE)
 *   ✅ Meaningful HTTP status codes (200, 201, 204, 400, 404, 422)
 *
 * HATEOAS (_links) is included as awareness-level demonstration (Level 3 preview).
 */

const express = require('express');
const router = express.Router();
const {
  getAllTasks,
  getTaskById,
  createTask,
  replaceTask,
  updateTask,
  deleteTask,
} = require('../models/taskModel');

// ─────────────────────────────────────────────
// Helper: Build HATEOAS _links for a task
// (Level 3 awareness — links embedded in response)
// ─────────────────────────────────────────────
const buildLinks = (taskId) => ({
  self:   { href: `/tasks/${taskId}`, method: 'GET'    },
  update: { href: `/tasks/${taskId}`, method: 'PUT'    },
  patch:  { href: `/tasks/${taskId}`, method: 'PATCH'  },
  delete: { href: `/tasks/${taskId}`, method: 'DELETE' },
  all:    { href: '/tasks',           method: 'GET'    },
});

// ─────────────────────────────────────────────
// Helper: Validate required fields
// ─────────────────────────────────────────────
const VALID_STATUSES   = ['pending', 'in-progress', 'completed'];
const VALID_PRIORITIES = ['low', 'medium', 'high'];

const validateTaskBody = (body, requireAll = true) => {
  const errors = [];
  if (requireAll && !body.title) errors.push('title is required.');
  if (body.title   !== undefined && typeof body.title !== 'string') errors.push('title must be a string.');
  if (body.status   !== undefined && !VALID_STATUSES.includes(body.status))
    errors.push(`status must be one of: ${VALID_STATUSES.join(', ')}.`);
  if (body.priority !== undefined && !VALID_PRIORITIES.includes(body.priority))
    errors.push(`priority must be one of: ${VALID_PRIORITIES.join(', ')}.`);
  return errors;
};

// ─────────────────────────────────────────────
// GET /tasks  — Retrieve all tasks
// Level 2: GET verb + 200 OK
// ─────────────────────────────────────────────
router.get('/', (req, res) => {
  const tasks = getAllTasks();
  // Support optional status filter: GET /tasks?status=pending
  const { status } = req.query;
  const result = status ? tasks.filter((t) => t.status === status) : tasks;
  return res.status(200).json({
    success: true,
    count: result.length,
    data: result.map((t) => ({ ...t, _links: buildLinks(t.id) })),
  });
});

// ─────────────────────────────────────────────
// GET /tasks/:id  — Retrieve a single task
// Level 2: GET verb + 200 OK / 404 Not Found
// ─────────────────────────────────────────────
router.get('/:id', (req, res) => {
  const task = getTaskById(req.params.id);
  if (!task) {
    return res.status(404).json({ success: false, message: `Task with id '${req.params.id}' not found.` });
  }
  return res.status(200).json({ success: true, data: { ...task, _links: buildLinks(task.id) } });
});

// ─────────────────────────────────────────────
// POST /tasks  — Create a new task
// Level 2: POST verb + 201 Created / 422 Unprocessable
// ─────────────────────────────────────────────
router.post('/', (req, res) => {
  const errors = validateTaskBody(req.body, true);
  if (errors.length > 0) {
    return res.status(422).json({ success: false, message: 'Validation failed.', errors });
  }
  const task = createTask(req.body);
  // 201 Created + Location header pointing to the new resource
  return res
    .status(201)
    .location(`/tasks/${task.id}`)
    .json({ success: true, data: { ...task, _links: buildLinks(task.id) } });
});

// ─────────────────────────────────────────────
// PUT /tasks/:id  — Fully replace a task
// Level 2: PUT verb + 200 OK / 404 Not Found / 422 Unprocessable
// ─────────────────────────────────────────────
router.put('/:id', (req, res) => {
  const errors = validateTaskBody(req.body, true);
  if (errors.length > 0) {
    return res.status(422).json({ success: false, message: 'Validation failed.', errors });
  }
  const task = replaceTask(req.params.id, req.body);
  if (!task) {
    return res.status(404).json({ success: false, message: `Task with id '${req.params.id}' not found.` });
  }
  return res.status(200).json({ success: true, data: { ...task, _links: buildLinks(task.id) } });
});

// ─────────────────────────────────────────────
// PATCH /tasks/:id  — Partially update a task
// Level 2: PATCH verb + 200 OK / 404 Not Found / 422 Unprocessable
// ─────────────────────────────────────────────
router.patch('/:id', (req, res) => {
  const errors = validateTaskBody(req.body, false);
  if (errors.length > 0) {
    return res.status(422).json({ success: false, message: 'Validation failed.', errors });
  }
  if (Object.keys(req.body).length === 0) {
    return res.status(400).json({ success: false, message: 'Request body must not be empty for PATCH.' });
  }
  const task = updateTask(req.params.id, req.body);
  if (!task) {
    return res.status(404).json({ success: false, message: `Task with id '${req.params.id}' not found.` });
  }
  return res.status(200).json({ success: true, data: { ...task, _links: buildLinks(task.id) } });
});

// ─────────────────────────────────────────────
// DELETE /tasks/:id  — Delete a task
// Level 2: DELETE verb + 204 No Content / 404 Not Found
// ─────────────────────────────────────────────
router.delete('/:id', (req, res) => {
  const deleted = deleteTask(req.params.id);
  if (!deleted) {
    return res.status(404).json({ success: false, message: `Task with id '${req.params.id}' not found.` });
  }
  // 204 No Content — successful deletion, no body
  return res.status(204).send();
});

module.exports = router;
