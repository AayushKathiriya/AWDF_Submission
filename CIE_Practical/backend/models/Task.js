/**
 * models/Task.js — Task Schema
 * CIE Practical: T5 (MongoDB + Schema Validation)
 * Features: required, enum, min constraints, and .populate() references
 */

const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required.'],
      trim: true,
      minlength: [3, 'Task title must be at least 3 characters.'],
      maxlength: [120, 'Task title cannot exceed 120 characters.'],
    },
    description: {
      type: String,
      required: [true, 'Task description is required.'],
      trim: true,
      minlength: [5, 'Task description must be at least 5 characters.'],
    },
    priority: {
      type: String,
      required: [true, 'Task priority is required.'],
      enum: {
        values: ['Low', 'Medium', 'High', 'Urgent'],
        message: '{VALUE} is not a valid priority. Allowed: Low, Medium, High, Urgent.',
      },
      default: 'Medium',
    },
    status: {
      type: String,
      required: [true, 'Task status is required.'],
      enum: {
        values: ['Pending', 'In Progress', 'Completed', 'Archived'],
        message: '{VALUE} is not a valid status. Allowed: Pending, In Progress, Completed, Archived.',
      },
      default: 'Pending',
    },
    estimatedHours: {
      type: Number,
      required: [true, 'Estimated hours is required.'],
      min: [1, 'Estimated hours must be at least 1 hour.'],
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Task must be assigned to an existing User.'],
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Task must be linked to an active Project.'],
    },
    dueDate: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Task', taskSchema);
