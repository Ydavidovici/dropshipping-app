// middleware/loggerMiddleware.js

const morgan = require('morgan');
const logger = require('../utils/logger');

// Define a stream object with a 'write' function that will be used by morgan
const stream = {
  write: (message) => logger.info(message.trim()),
};

// Skip logging during test
const skip = () => {
  const env = process.env.NODE_ENV || 'development';
  return env === 'test';
};

// Configure morgan middleware
const loggerMiddleware = morgan('combined', { stream, skip });

module.exports = loggerMiddleware;
