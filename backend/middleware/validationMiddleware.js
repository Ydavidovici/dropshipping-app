// middleware/validationMiddleware.js

const { errorResponse } = require('../utils/apiResponse');
const logger = require('../utils/logger');

/**
 * Validation middleware to validate request bodies against a Joi schema.
 * @param {Object} schema - Joi validation schema.
 * @param {string} [property='body'] - Property of the request to validate (e.g., 'body', 'params', 'query').
 * @returns {Function} - Express middleware function.
 */
const validateRequest = (schema, property = 'body') => {
  return (req, res, next) => {
    const dataToValidate = req[property];
    const { error } = schema.validate(dataToValidate, { abortEarly: false });

    if (error) {
      logger.warn(`Validation error on ${property}: ${error.message}`);
      const errorMessages = error.details.map((detail) => detail.message);
      return errorResponse(res, 400, `Validation error: ${errorMessages.join(', ')}`);
    }

    next();
  };
};

module.exports = validateRequest;
