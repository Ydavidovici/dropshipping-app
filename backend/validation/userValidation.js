// validation/userValidation.js

const Joi = require('joi');

const createUserSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('admin', 'customer').optional(),
});

const updateUserSchema = Joi.object({
  username: Joi.string().min(3).max(30).optional(),
  email: Joi.string().email().optional(),
  password: Joi.string().min(6).optional(),
  role: Joi.string().valid('admin', 'customer').optional(),
});

module.exports = {
  createUserSchema,
  updateUserSchema,
};
