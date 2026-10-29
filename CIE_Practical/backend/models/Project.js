/**
 * models/Project.js — Project Schema
 * CIE Practical: T5 (MongoDB + Schema Validation)
 * Features: required, minlength, unique, enum, min validation
 */

const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Project name is required.'],
      unique: true,
      trim: true,
      minlength: [3, 'Project name must be at least 3 characters.'],
    },
    code: {
      type: String,
      required: [true, 'Project code is required.'],
      unique: true,
      uppercase: true,
      trim: true,
      minlength: [2, 'Project code must be at least 2 characters.'],
      maxlength: [10, 'Project code cannot exceed 10 characters.'],
    },
    category: {
      type: String,
      required: [true, 'Category is required.'],
      enum: {
        values: ['Engineering', 'Design', 'Marketing', 'Infrastructure'],
        message: '{VALUE} is not a valid project category.',
      },
      default: 'Engineering',
    },
    budgetHours: {
      type: Number,
      required: [true, 'Budget hours allocation is required.'],
      min: [1, 'Budget hours must be at least 1 hour.'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Project', projectSchema);
