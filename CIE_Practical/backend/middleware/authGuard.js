/**
 * middleware/authGuard.js — Authentication Guard Middleware
 * CIE Practical: T3 (RESTful API + Middleware)
 * Protects endpoints by verifying Bearer JWT tokens in Authorization headers.
 */

const jwt = require('jsonwebtoken');

module.exports = function authGuard(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'Access denied. Bearer token missing in Authorization header.',
    });
  }

  const token = authHeader.split(' ')[1];
  const secret = process.env.JWT_SECRET || 'cie_practical_secret_jwt_key_2026_super_secure';

  try {
    const decoded = jwt.verify(token, secret);
    req.user = decoded; // { id, email, role }
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: 'Invalid Token',
      message: 'Authentication token is expired, invalid, or malformed.',
    });
  }
};
