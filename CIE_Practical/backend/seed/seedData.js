/**
 * seed/seedData.js — Database Seeding Script
 * CIE Practical: T5 (MongoDB + Schema Validation)
 * Run via: npm run seed
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User     = require('../models/User');
const Project  = require('../models/Project');
const Task     = require('../models/Task');

const seedDatabase = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cie_task_management';
  try {
    await mongoose.connect(uri);
    console.log('[SEED] Connected to MongoDB.');

    // Clear existing collections
    await Task.deleteMany({});
    await Project.deleteMany({});
    await User.deleteMany({});
    console.log('[SEED] Cleared existing tasks, projects, and users.');

    // 1. Seed Users
    const users = await User.create([
      { name: 'Aayush Kathiriya', email: 'aayush@cie.edu', password: 'password123', role: 'admin' },
      { name: 'Sarah Chen', email: 'sarah@cie.edu', password: 'password123', role: 'developer' },
      { name: 'Marcus Vance', email: 'marcus@cie.edu', password: 'password123', role: 'manager' },
    ]);
    console.log(`[SEED] Created ${users.length} users.`);

    // 2. Seed Projects
    const projects = await Project.create([
      { name: 'TaskFlow NextGen', code: 'TFN-2026', category: 'Engineering', budgetHours: 120 },
      { name: 'Security Hardening', code: 'SEC-TLS', category: 'Infrastructure', budgetHours: 80 },
      { name: 'UI/UX Redesign', code: 'DSN-AI', category: 'Design', budgetHours: 60 },
    ]);
    console.log(`[SEED] Created ${projects.length} projects.`);

    // 3. Seed Tasks with Relationships
    const tasks = await Task.create([
      {
        title: 'Implement JWT AuthGuard Middleware',
        description: 'Protect all sensitive mutation endpoints with token validation and custom request logging.',
        priority: 'High',
        status: 'Completed',
        estimatedHours: 8,
        assignedTo: users[0]._id,
        project: projects[1]._id,
      },
      {
        title: 'Build Reusable TaskCard Component',
        description: 'Ensure props validation, priority badge color swap, and dynamic status toggle button rendering.',
        priority: 'Medium',
        status: 'Pending',
        estimatedHours: 12,
        assignedTo: users[1]._id,
        project: projects[0]._id,
      },
      {
        title: 'Mongoose 3-Schema Validation Suite',
        description: 'Enforce required, unique, enum, and min constraints with structured error formatting.',
        priority: 'Urgent',
        status: 'In Progress',
        estimatedHours: 16,
        assignedTo: users[0]._id,
        project: projects[0]._id,
      },
      {
        title: 'React Router v6 Protected Navigation',
        description: 'Configure protected routing that redirects unauthenticated users to the login route.',
        priority: 'Medium',
        status: 'Completed',
        estimatedHours: 6,
        assignedTo: users[2]._id,
        project: projects[2]._id,
      },
    ]);
    console.log(`[SEED] Created ${tasks.length} tasks with populated references.`);

    console.log('\n[SEED SUCCESS] All CIE Practical seed data loaded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('[SEED ERROR]', err.message);
    process.exit(1);
  }
};

seedDatabase();
