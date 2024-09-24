// validation/reviewValidation.js

const Joi = require('joi');

const createReviewSchema = Joi.object({
  product_id: Joi.number().integer().required(),
  rating: Joi.number().integer().min(1).max(5).required(),
  comment: Joi.string().max(1000).optional(),
});

const updateReviewSchema = Joi.object({
  rating: Joi.number().integer().min(1).max(5).optional(),
  comment: Joi.string().max(1000).optional(),
});

module.exports = {
  createReviewSchema,
  updateReviewSchema,
};
