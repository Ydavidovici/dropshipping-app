// validation/alertValidation.js

const Joi = require('joi');

const createAlertSchema = Joi.object({
  condition_type: Joi.string().valid('price_drop', 'stock_low', 'new_arrival').required(),
  threshold: Joi.number().positive().required(),
  // Add other necessary fields
});

const updateAlertSchema = Joi.object({
  condition_type: Joi.string().valid('price_drop', 'stock_low', 'new_arrival').optional(),
  threshold: Joi.number().positive().optional(),
  // Add other necessary fields
});

module.exports = {
  createAlertSchema,
  updateAlertSchema,
};
