/**
 * models/User.js — User Schema
 * CIE Practical: T5 (MongoDB + Schema Validation)
 * Features: required, minlength, unique, enum, password hashing
 */

const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'User name is required.'],
      trim: true,
      minlength: [2, 'User name must be at least 2 characters.'],
    },
    email: {
      type: String,
      required: [true, 'User email is required.'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address.'],
    },
    password: {
      type: String,
      required: [true, 'Password is required.'],
      minlength: [6, 'Password must be at least 6 characters.'],
    },
    role: {
      type: String,
      required: [true, 'Role is required.'],
      enum: {
        values: ['admin', 'manager', 'developer'],
        message: '{VALUE} is not a valid role. Allowed: admin, manager, developer.',
      },
      default: 'developer',
    },
  },
  { timestamps: true }
);

// Pre-save hook to hash password if modified
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
