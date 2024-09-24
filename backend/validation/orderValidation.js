// validation/orderValidation.js

const Joi = require('joi');

const createOrderSchema = Joi.object({
  product_id: Joi.number().integer().required(),
  quantity: Joi.number().integer().min(1).required(),
  // Add other necessary fields, such as shipping_address, payment_method, etc.
  shipping_address: Joi.object({
    street: Joi.string().min(3).max(100).required(),
    city: Joi.string().min(2).max(50).required(),
    state: Joi.string().min(2).max(50).required(),
    zip: Joi.string().pattern(/^\d{5}(-\d{4})?$/).required(),
    country: Joi.string().min(2).max(50).required(),
  }).required(),
  payment_method: Joi.string().valid('credit_card', 'paypal', 'bank_transfer').required(),
});

const updateOrderSchema = Joi.object({
  status: Joi.string().valid('Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled').optional(),
  // Add other updatable fields as necessary
});

module.exports = {
  createOrderSchema,
  updateOrderSchema,
};
