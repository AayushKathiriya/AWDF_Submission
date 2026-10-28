/**
 * taskModel.js — In-memory Task Store
 * Week 7 Assignment: Security Hardening
 */

const { v4: uuidv4 } = require('uuid');

let tasks = [
  {
    id: '1a2b3c4d-0001',
    title: 'Design Database Schema',
    description: 'Design the relational schema for the task management app.',
    status: 'completed',
    priority: 'high',
    createdAt: new Date('2026-10-01T09:00:00Z').toISOString(),
    updatedAt: new Date('2026-10-05T11:00:00Z').toISOString(),
  },
  {
    id: '1a2b3c4d-0002',
    title: 'Build REST API',
    description: 'Implement RESTful endpoints using Express.js.',
    status: 'in-progress',
    priority: 'high',
    createdAt: new Date('2026-10-06T09:00:00Z').toISOString(),
    updatedAt: new Date('2026-10-06T09:00:00Z').toISOString(),
  },
  {
    id: '1a2b3c4d-0003',
    title: 'Write Unit Tests',
    description: 'Write unit tests for all API endpoints.',
    status: 'pending',
    priority: 'medium',
    createdAt: new Date('2026-10-06T10:00:00Z').toISOString(),
    updatedAt: new Date('2026-10-06T10:00:00Z').toISOString(),
  },
];

const getAllTasks    = ()     => tasks;
const getTaskById   = (id)   => tasks.find((t) => t.id === id) || null;

const createTask = ({ title, description = '', status = 'pending', priority = 'medium' }) => {
  const now     = new Date().toISOString();
  const newTask = { id: uuidv4(), title, description, status, priority, createdAt: now, updatedAt: now };
  tasks.push(newTask);
  return newTask;
};

const replaceTask = (id, { title, description = '', status = 'pending', priority = 'medium' }) => {
  const index = tasks.findIndex((t) => t.id === id);
  if (index === -1) return null;
  const updated = { ...tasks[index], title, description, status, priority, updatedAt: new Date().toISOString() };
  tasks[index]  = updated;
  return updated;
};

const updateTask = (id, fields) => {
  const index = tasks.findIndex((t) => t.id === id);
  if (index === -1) return null;
  tasks[index] = { ...tasks[index], ...fields, updatedAt: new Date().toISOString() };
  return tasks[index];
};

const deleteTask = (id) => {
  const index = tasks.findIndex((t) => t.id === id);
  if (index === -1) return false;
  tasks.splice(index, 1);
  return true;
};

module.exports = { getAllTasks, getTaskById, createTask, replaceTask, updateTask, deleteTask };
