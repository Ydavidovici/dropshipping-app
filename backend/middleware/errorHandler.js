// middleware/errorHandler.js

const logger = require('../utils/logger');

/**
 * Centralized Error Handling Middleware.
 * Catches all errors and sends a structured response.
 */
const errorHandler = (err, req, res, next) => {
  // Log the error
  logger.error(`${err.message} - ${req.method} ${req.originalUrl} - ${req.ip}`);

  // Set the status code
  const statusCode = err.statusCode || 500;

  // Send the response
  res.status(statusCode).json({
    error: err.message || 'Internal Server Error',
  });
};

module.exports = errorHandler;
