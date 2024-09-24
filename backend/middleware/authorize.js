// middleware/authorize.js

const logger = require('../utils/logger');

/**
 * Middleware to authorize users based on their roles.
 * @param {Array<string>} roles - Array of roles permitted to access the route.
 */
const authorize = (roles = []) => {
  // roles param can be a single role string (e.g., 'admin') or an array of roles (e.g., ['admin', 'user'])
  if (typeof roles === 'string') {
    roles = [roles];
  }

  return (req, res, next) => {
    if (!req.user) {
      logger.warn('Authorization attempted without authentication.');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (roles.length && !roles.includes(req.user.role)) {
      logger.warn(`User with role ${req.user.role} attempted to access a restricted route.`);
      return res.status(403).json({ error: 'Forbidden' });
    }

    // User is authorized
    next();
  };
};

module.exports = authorize;
