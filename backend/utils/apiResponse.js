// utils/apiResponse.js

/**
 * Sends a standardized success response.
 * @param {Object} res - Express response object.
 * @param {number} statusCode - HTTP status code.
 * @param {string} message - Success message.
 * @param {Object} data - Response payload.
 */
const successResponse = (res, statusCode, message, data = {}) => {
  res.status(statusCode).json({
    status: 'success',
    message,
    data,
  });
};

/**
 * Sends a standardized error response.
 * @param {Object} res - Express response object.
 * @param {number} statusCode - HTTP status code.
 * @param {string} error - Error message.
 */
const errorResponse = (res, statusCode, error) => {
  res.status(statusCode).json({
    status: 'error',
    message: error,
  });
};

module.exports = {
  successResponse,
  errorResponse,
};
