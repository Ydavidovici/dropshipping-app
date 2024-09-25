// backend/validation/alertsValidation.js

const Joi = require('joi');

const createAlertSchema = Joi.object({
  product_id: Joi.number().integer().required(),
  condition_type: Joi.string().valid('price_drop', 'stock_low', 'new_competitor').required(),
  threshold: Joi.number().positive().required(),
  notification_method: Joi.string().valid('email', 'sms', 'push').required(),
  active: Joi.boolean().default(true),
});

const updateAlertSchema = Joi.object({
  condition_type: Joi.string().valid('price_drop', 'stock_low', 'new_competitor').optional(),
  threshold: Joi.number().positive().optional(),
  notification_method: Joi.string().valid('email', 'sms', 'push').optional(),
  active: Joi.boolean().optional(),
});

const getAlertSchema = Joi.object({
  alert_id: Joi.number().integer().required(),
});

const deleteAlertSchema = Joi.object({
  alert_id: Joi.number().integer().required(),
});

module.exports = {
  createAlertSchema,
  updateAlertSchema,
  getAlertSchema,
  deleteAlertSchema,
};
