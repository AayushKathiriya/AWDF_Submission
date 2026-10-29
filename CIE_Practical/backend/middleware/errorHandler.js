/**
 * middleware/errorHandler.js — Global Structured Error Handler
 * CIE Practical: T3 & T5 (RESTful API + Schema Validation)
 * Catches Mongoose errors and transforms them into clean, human-readable 400 JSON.
 */

module.exports = function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let errorName = err.name || 'InternalServerError';
  let message = err.message || 'An unexpected server error occurred.';
  let details = [];

  // 1. Mongoose Schema Validation Error (Clean 400 response)
  if (err.name === 'ValidationError') {
    statusCode = 400;
    errorName = 'ValidationError';
    details = Object.values(err.errors).map((e) => e.message);
    message = details.join(' | ');
  }

  // 2. Mongoose Invalid ObjectId (CastError)
  else if (err.name === 'CastError') {
    statusCode = 400;
    errorName = 'InvalidIdentifier';
    message = `Resource not found with ID of '${err.value}'. Invalid ObjectId format.`;
    details = [`Failed to cast value '${err.value}' to field '${err.path}'`];
  }

  // 3. MongoDB Duplicate Key (E11000)
  else if (err.code === 11000) {
    statusCode = 400;
    errorName = 'DuplicateKeyError';
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const value = err.keyValue ? err.keyValue[field] : '';
    message = `Duplicate value '${value}' entered for unique field '${field}'.`;
    details = [message];
  }

  // 4. JWT Errors
  else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    errorName = 'Unauthorized';
    message = 'Invalid authentication token provided.';
  }

  // Log error stack for developer visibility
  if (process.env.NODE_ENV !== 'production') {
    console.error(`\x1b[31m[ERROR] ${errorName} (${statusCode}):\x1b[0m ${message}`);
  }

  // Send clean structured JSON response (Never raw Mongoose stack trace)
  return res.status(statusCode).json({
    success: false,
    statusCode,
    error: errorName,
    message,
    details: details.length > 0 ? details : undefined,
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
  });
};
