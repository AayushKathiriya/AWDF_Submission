/**
 * middleware/requestLogger.js — Custom Request Logging Middleware
 * CIE Practical: T3 (RESTful API + Middleware)
 * Logs HTTP method, URL, timestamp, response status, and duration (ms).
 */

module.exports = function requestLogger(req, res, next) {
  const start = Date.now();
  const timestamp = new Date().toISOString();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const color = status >= 500 ? '\x1b[31m' : status >= 400 ? '\x1b[33m' : '\x1b[32m';
    const reset = '\x1b[0m';

    console.log(
      `[LOGGER] ${timestamp} | ${req.method} ${req.originalUrl} -> ${color}${status}${reset} (${duration}ms)`
    );
  });

  next();
};
