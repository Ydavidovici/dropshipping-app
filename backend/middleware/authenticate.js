// middleware/authenticate.js

const { verifyToken } = require('../utils/jwt');
const logger = require('../utils/logger');

/**
 * Middleware to authenticate users by verifying JWT tokens.
 * Attaches the decoded user information to req.user if valid.
 */
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Check if Authorization header is present and formatted correctly
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    logger.warn('Authorization header missing or malformed.');
    return res.status(401).json({ error: 'Authorization header missing or malformed.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyToken(token);
    req.user = decoded; // Attach decoded payload to request
    next();
  } catch (error) {
    logger.error(`Authentication error: ${error.message}`);
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

module.exports = authenticate;
