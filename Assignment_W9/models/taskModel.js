/**
 * taskModel.js — In-memory Task Store (extended seed: 25 tasks)
 * Week 9 Assignment: Performance Load Testing
 * Author: Aayush Kathiriya
 */

const { v4: uuidv4 } = require('uuid');

// ── Pre-seeded task data (25 tasks to ensure meaningful load test results) ───
let tasks = [
  { id: uuidv4(), title: 'Design Database Schema',        description: 'Design the relational schema for the task management app.',     status: 'completed',  priority: 'high',   createdAt: new Date('2026-09-01').toISOString(), updatedAt: new Date('2026-09-05').toISOString() },
  { id: uuidv4(), title: 'Build REST API',                description: 'Implement RESTful endpoints using Express.js.',                  status: 'completed',  priority: 'high',   createdAt: new Date('2026-09-06').toISOString(), updatedAt: new Date('2026-09-10').toISOString() },
  { id: uuidv4(), title: 'Write Unit Tests',              description: 'Write unit tests for all API endpoints.',                        status: 'completed',  priority: 'medium', createdAt: new Date('2026-09-11').toISOString(), updatedAt: new Date('2026-09-15').toISOString() },
  { id: uuidv4(), title: 'Configure CI/CD Pipeline',      description: 'Set up GitHub Actions for automated testing and deployment.',    status: 'in-progress',priority: 'high',   createdAt: new Date('2026-09-16').toISOString(), updatedAt: new Date('2026-09-16').toISOString() },
  { id: uuidv4(), title: 'Implement Authentication',      description: 'Add JWT-based authentication to protect API routes.',           status: 'in-progress',priority: 'high',   createdAt: new Date('2026-09-17').toISOString(), updatedAt: new Date('2026-09-17').toISOString() },
  { id: uuidv4(), title: 'Add Rate Limiting',             description: 'Implement express-rate-limit to prevent API abuse.',            status: 'pending',    priority: 'medium', createdAt: new Date('2026-09-18').toISOString(), updatedAt: new Date('2026-09-18').toISOString() },
  { id: uuidv4(), title: 'Set Up Redis Cache',            description: 'Integrate Redis for distributed caching.',                      status: 'pending',    priority: 'medium', createdAt: new Date('2026-09-19').toISOString(), updatedAt: new Date('2026-09-19').toISOString() },
  { id: uuidv4(), title: 'Write Integration Tests',       description: 'Write integration tests covering full request-response cycles.', status: 'pending',    priority: 'medium', createdAt: new Date('2026-09-20').toISOString(), updatedAt: new Date('2026-09-20').toISOString() },
  { id: uuidv4(), title: 'Optimise Database Queries',     description: 'Add indexes and query optimisations to MongoDB collections.',   status: 'pending',    priority: 'high',   createdAt: new Date('2026-09-21').toISOString(), updatedAt: new Date('2026-09-21').toISOString() },
  { id: uuidv4(), title: 'Implement Pagination',          description: 'Add cursor-based pagination to GET /tasks.',                    status: 'pending',    priority: 'low',    createdAt: new Date('2026-09-22').toISOString(), updatedAt: new Date('2026-09-22').toISOString() },
  { id: uuidv4(), title: 'Write API Documentation',       description: 'Generate OpenAPI 3.0 spec using swagger-jsdoc.',               status: 'pending',    priority: 'medium', createdAt: new Date('2026-09-23').toISOString(), updatedAt: new Date('2026-09-23').toISOString() },
  { id: uuidv4(), title: 'Performance Profiling',         description: 'Profile CPU and memory usage under load.',                      status: 'pending',    priority: 'medium', createdAt: new Date('2026-09-24').toISOString(), updatedAt: new Date('2026-09-24').toISOString() },
  { id: uuidv4(), title: 'Implement HATEOAS Links',       description: 'Add hypermedia links to all task responses (Level 3 RMM).',    status: 'pending',    priority: 'low',    createdAt: new Date('2026-09-25').toISOString(), updatedAt: new Date('2026-09-25').toISOString() },
  { id: uuidv4(), title: 'Containerise with Docker',      description: 'Write Dockerfile and docker-compose.yml for the API.',         status: 'pending',    priority: 'medium', createdAt: new Date('2026-09-26').toISOString(), updatedAt: new Date('2026-09-26').toISOString() },
  { id: uuidv4(), title: 'Configure Health Check Route',  description: 'Add GET /health endpoint for uptime monitoring.',              status: 'pending',    priority: 'low',    createdAt: new Date('2026-09-27').toISOString(), updatedAt: new Date('2026-09-27').toISOString() },
  { id: uuidv4(), title: 'Add Structured Logging',        description: 'Integrate winston for JSON-formatted structured logging.',      status: 'pending',    priority: 'low',    createdAt: new Date('2026-09-28').toISOString(), updatedAt: new Date('2026-09-28').toISOString() },
  { id: uuidv4(), title: 'Review Security Headers',       description: 'Audit and update all HTTP security response headers.',         status: 'pending',    priority: 'medium', createdAt: new Date('2026-09-29').toISOString(), updatedAt: new Date('2026-09-29').toISOString() },
  { id: uuidv4(), title: 'Implement Soft Delete',         description: 'Add isDeleted flag to tasks instead of hard delete.',          status: 'pending',    priority: 'low',    createdAt: new Date('2026-09-30').toISOString(), updatedAt: new Date('2026-09-30').toISOString() },
  { id: uuidv4(), title: 'Add Task Due Dates',            description: 'Extend task schema to include dueDate and overdue flag.',      status: 'pending',    priority: 'medium', createdAt: new Date('2026-10-01').toISOString(), updatedAt: new Date('2026-10-01').toISOString() },
  { id: uuidv4(), title: 'Build Admin Dashboard',         description: 'Create a minimal web dashboard for task management.',          status: 'pending',    priority: 'low',    createdAt: new Date('2026-10-02').toISOString(), updatedAt: new Date('2026-10-02').toISOString() },
  { id: uuidv4(), title: 'Set Up Monitoring with PM2',    description: 'Use PM2 cluster mode for process management.',                 status: 'pending',    priority: 'medium', createdAt: new Date('2026-10-03').toISOString(), updatedAt: new Date('2026-10-03').toISOString() },
  { id: uuidv4(), title: 'Conduct Code Review',           description: 'Peer review all route handlers and middleware.',               status: 'pending',    priority: 'medium', createdAt: new Date('2026-10-04').toISOString(), updatedAt: new Date('2026-10-04').toISOString() },
  { id: uuidv4(), title: 'Configure Environment Variables','description': 'Move all secrets to .env and validate with envalid.',        status: 'pending',    priority: 'high',   createdAt: new Date('2026-10-05').toISOString(), updatedAt: new Date('2026-10-05').toISOString() },
  { id: uuidv4(), title: 'Write Deployment Runbook',      description: 'Document step-by-step production deployment procedure.',       status: 'pending',    priority: 'low',    createdAt: new Date('2026-10-06').toISOString(), updatedAt: new Date('2026-10-06').toISOString() },
  { id: uuidv4(), title: 'Performance Load Testing',      description: 'Run Apache Bench load tests and document results in LOADTEST.md.', status: 'in-progress', priority: 'high', createdAt: new Date('2026-10-07').toISOString(), updatedAt: new Date('2026-10-07').toISOString() },
];

const getAllTasks  = ()    => tasks;
const getTaskById = (id)  => tasks.find((t) => t.id === id) || null;

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
