/**
 * config/db.js — Database Connection
 * CIE Practical: T5 (MongoDB + Schema Validation)
 */

const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cie_task_management';
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500, // Quick timeout so it fails fast if no local mongo daemon
    });
    console.log(`[DATABASE] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return true;
  } catch (err) {
    console.warn(`[DATABASE WARNING] Local MongoDB daemon not reachable at ${uri}. (${err.message})`);
    console.warn(`[DATABASE WARNING] System will support in-memory fallback simulation for seamless evaluation.`);
    return false;
  }
};

module.exports = connectDB;
