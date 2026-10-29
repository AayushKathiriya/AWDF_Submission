/**
 * routes/taskRoutes.js — Task RESTful Endpoints
 * CIE Practical: T3 & T5 (RESTful API + Schema Validation)
 *
 * Endpoints:
 *   1. GET    /api/v1/tasks            (Populates assignedTo & project)
 *   2. GET    /api/v1/tasks/:id        (Populates single task)
 *   3. POST   /api/v1/tasks            (authGuard, validates, saves with 201)
 *   4. PATCH  /api/v1/tasks/:id/status (authGuard, conditional button swap update)
 *   5. DELETE /api/v1/tasks/:id        (authGuard, removes task)
 *   6. GET    /api/v1/projects         (dropdown data for forms)
 *   7. GET    /api/v1/users            (dropdown data for forms)
 */

const express   = require('express');
const router    = express.Router();
const mongoose  = require('mongoose');
const Task      = require('../models/Task');
const Project   = require('../models/Project');
const User      = require('../models/User');
const authGuard = require('../middleware/authGuard');

// In-memory demo store used if MongoDB connection is inactive
const IN_MEMORY_PROJECTS = [
  { _id: '66b000000000000000000001', name: 'TaskFlow NextGen', code: 'TFN-2026', category: 'Engineering', budgetHours: 120, isActive: true },
  { _id: '66b000000000000000000002', name: 'Security Hardening', code: 'SEC-TLS', category: 'Infrastructure', budgetHours: 80, isActive: true },
  { _id: '66b000000000000000000003', name: 'UI/UX Redesign', code: 'DSN-AI', category: 'Design', budgetHours: 60, isActive: true },
];

const IN_MEMORY_USERS = [
  { _id: '66a000000000000000000001', name: 'Aayush Kathiriya', email: 'aayush@cie.edu', role: 'admin' },
  { _id: '66a000000000000000000002', name: 'Sarah Chen', email: 'sarah@cie.edu', role: 'developer' },
  { _id: '66a000000000000000000003', name: 'Marcus Vance', email: 'marcus@cie.edu', role: 'manager' },
];

let inMemoryTasks = [
  {
    _id: '66c000000000000000000001',
    title: 'Implement JWT AuthGuard Middleware',
    description: 'Protect all sensitive mutation endpoints with token validation and custom request logging.',
    priority: 'High',
    status: 'Completed',
    estimatedHours: 8,
    assignedTo: IN_MEMORY_USERS[0],
    project: IN_MEMORY_PROJECTS[1],
    createdAt: new Date('2026-10-25'),
  },
  {
    _id: '66c000000000000000000002',
    title: 'Build Reusable TaskCard Component',
    description: 'Ensure props validation, priority badge color swap, and dynamic status toggle button rendering.',
    priority: 'Medium',
    status: 'Pending',
    estimatedHours: 12,
    assignedTo: IN_MEMORY_USERS[1],
    project: IN_MEMORY_PROJECTS[0],
    createdAt: new Date('2026-10-27'),
  },
  {
    _id: '66c000000000000000000003',
    title: 'Mongoose 3-Schema Validation Suite',
    description: 'Enforce required, unique, enum, and min constraints with structured error formatting.',
    priority: 'Urgent',
    status: 'In Progress',
    estimatedHours: 16,
    assignedTo: IN_MEMORY_USERS[0],
    project: IN_MEMORY_PROJECTS[0],
    createdAt: new Date('2026-10-28'),
  },
];

const isDbConnected = () => mongoose.connection.readyState === 1;

// ── GET /api/v1/projects ──────────────────────────────────────────────────────
router.get('/projects', async (req, res, next) => {
  try {
    if (isDbConnected()) {
      const projects = await Project.find({ isActive: true });
      return res.status(200).json({ success: true, count: projects.length, data: projects });
    }
    return res.status(200).json({ success: true, count: IN_MEMORY_PROJECTS.length, data: IN_MEMORY_PROJECTS });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/v1/users ────────────────────────────────────────────────────────
router.get('/users', async (req, res, next) => {
  try {
    if (isDbConnected()) {
      const users = await User.find({}, 'name email role');
      return res.status(200).json({ success: true, count: users.length, data: users });
    }
    return res.status(200).json({ success: true, count: IN_MEMORY_USERS.length, data: IN_MEMORY_USERS });
  } catch (err) {
    next(err);
  }
});

// ── 1. GET /api/v1/tasks (200 OK) — Uses .populate() ─────────────────────────
router.get('/tasks', async (req, res, next) => {
  try {
    if (isDbConnected()) {
      const tasks = await Task.find()
        .populate('assignedTo', 'name email role')
        .populate('project', 'name code category budgetHours')
        .sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        count: tasks.length,
        data: tasks,
      });
    }

    // In-memory populated fallback
    return res.status(200).json({
      success: true,
      count: inMemoryTasks.length,
      data: inMemoryTasks,
    });
  } catch (err) {
    next(err);
  }
});

// ── 2. GET /api/v1/tasks/:id (200 OK) — Single populated resource ────────────
router.get('/tasks/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    if (isDbConnected()) {
      const task = await Task.findById(id)
        .populate('assignedTo', 'name email role')
        .populate('project', 'name code category budgetHours');

      if (!task) {
        return res.status(404).json({
          success: false,
          error: 'ResourceNotFound',
          message: `Task with id '${id}' was not found.`,
        });
      }

      return res.status(200).json({ success: true, data: task });
    }

    const task = inMemoryTasks.find((t) => t._id === id);
    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'ResourceNotFound',
        message: `Task with id '${id}' was not found.`,
      });
    }

    return res.status(200).json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
});

// ── 3. POST /api/v1/tasks (201 Created) — authGuard & Schema Validation ──────
router.post('/tasks', authGuard, async (req, res, next) => {
  try {
    const { title, description, priority, estimatedHours, assignedTo, project, status } = req.body;

    // Business-rule check: Ensure project is provided and valid
    if (!project) {
      return res.status(400).json({
        success: false,
        error: 'ValidationError',
        message: 'Task must be linked to a valid project.',
        details: ['project field is required.'],
      });
    }

    if (isDbConnected()) {
      const projectDoc = await Project.findById(project);
      if (!projectDoc) {
        return res.status(400).json({
          success: false,
          error: 'BusinessRuleViolation',
          message: 'The selected project does not exist or has been archived.',
        });
      }

      // Create new Task document — triggers Mongoose Schema validation
      const newTask = new Task({
        title,
        description,
        priority,
        estimatedHours,
        assignedTo,
        project,
        status: status || 'Pending',
      });

      await newTask.save();

      // Populate references for client consumption
      await newTask.populate('assignedTo', 'name email role');
      await newTask.populate('project', 'name code category');

      return res.status(201).json({
        success: true,
        message: 'Task created successfully.',
        data: newTask,
      });
    }

    // In-Memory Validation Simulation
    if (!title || title.trim().length < 3) {
      return res.status(400).json({
        success: false,
        error: 'ValidationError',
        message: 'Task title must be at least 3 characters.',
        details: ['title: Task title must be at least 3 characters.'],
      });
    }

    if (!description || description.trim().length < 5) {
      return res.status(400).json({
        success: false,
        error: 'ValidationError',
        message: 'Task description must be at least 5 characters.',
        details: ['description: Task description must be at least 5 characters.'],
      });
    }

    const validPriorities = ['Low', 'Medium', 'High', 'Urgent'];
    if (priority && !validPriorities.includes(priority)) {
      return res.status(400).json({
        success: false,
        error: 'ValidationError',
        message: `${priority} is not a valid priority. Allowed: Low, Medium, High, Urgent.`,
        details: ['priority: Invalid enum value.'],
      });
    }

    if (!estimatedHours || Number(estimatedHours) < 1) {
      return res.status(400).json({
        success: false,
        error: 'ValidationError',
        message: 'Estimated hours must be at least 1 hour.',
        details: ['estimatedHours: Value must be >= 1.'],
      });
    }

    const assignedUser = IN_MEMORY_USERS.find((u) => u._id === assignedTo) || IN_MEMORY_USERS[0];
    const projectTarget = IN_MEMORY_PROJECTS.find((p) => p._id === project) || IN_MEMORY_PROJECTS[0];

    const newTask = {
      _id: '66c000000000000000000' + (inMemoryTasks.length + 1).toString().padStart(3, '0'),
      title: title.trim(),
      description: description.trim(),
      priority: priority || 'Medium',
      status: status || 'Pending',
      estimatedHours: Number(estimatedHours),
      assignedTo: assignedUser,
      project: projectTarget,
      createdAt: new Date(),
    };

    inMemoryTasks = [newTask, ...inMemoryTasks];

    return res.status(201).json({
      success: true,
      message: 'Task created successfully.',
      data: newTask,
    });
  } catch (err) {
    next(err); // Passed to clean 400 error handler
  }
});

// ── 4. PATCH /api/v1/tasks/:id/status (200 OK) — Conditional button swap ─────
router.patch('/tasks/:id/status', authGuard, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['Pending', 'In Progress', 'Completed', 'Archived'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'ValidationError',
        message: `'${status}' is not a valid status. Allowed: ${validStatuses.join(', ')}.`,
      });
    }

    if (isDbConnected()) {
      const task = await Task.findByIdAndUpdate(
        id,
        { status },
        { new: true, runValidators: true }
      )
        .populate('assignedTo', 'name email role')
        .populate('project', 'name code category');

      if (!task) {
        return res.status(404).json({
          success: false,
          error: 'ResourceNotFound',
          message: `Task with id '${id}' not found.`,
        });
      }

      return res.status(200).json({
        success: true,
        message: `Task status updated to '${status}'.`,
        data: task,
      });
    }

    const taskIndex = inMemoryTasks.findIndex((t) => t._id === id);
    if (taskIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'ResourceNotFound',
        message: `Task with id '${id}' not found.`,
      });
    }

    inMemoryTasks[taskIndex].status = status;

    return res.status(200).json({
      success: true,
      message: `Task status updated to '${status}'.`,
      data: inMemoryTasks[taskIndex],
    });
  } catch (err) {
    next(err);
  }
});

// ── 5. DELETE /api/v1/tasks/:id (200 OK) — authGuard ─────────────────────────
router.delete('/tasks/:id', authGuard, async (req, res, next) => {
  try {
    const { id } = req.params;

    if (isDbConnected()) {
      const task = await Task.findByIdAndDelete(id);
      if (!task) {
        return res.status(404).json({
          success: false,
          error: 'ResourceNotFound',
          message: `Task with id '${id}' not found.`,
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Task deleted successfully.',
        data: { id },
      });
    }

    const taskIndex = inMemoryTasks.findIndex((t) => t._id === id);
    if (taskIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'ResourceNotFound',
        message: `Task with id '${id}' not found.`,
      });
    }

    inMemoryTasks.splice(taskIndex, 1);

    return res.status(200).json({
      success: true,
      message: 'Task deleted successfully.',
      data: { id },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
