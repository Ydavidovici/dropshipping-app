// backend/validation/scraperValidation.js

const Joi = require('joi');

const searchProductsSchema = Joi.object({
  keywords: Joi.string().required(),
  category: Joi.string().optional(),
  min_price: Joi.number().positive().optional(),
  max_price: Joi.number().positive().optional(),
  limit: Joi.number().integer().min(1).max(100).default(10),
});

const processProductDataSchema = Joi.object({
  name: Joi.string().required(),
  search_volume: Joi.number().integer().positive().optional(),
  sales_rank: Joi.number().integer().positive().optional(),
  competitor_count: Joi.number().integer().positive().optional(),
  shipping_cost: Joi.number().positive().optional(),
  return_rate: Joi.number().min(0).max(1).optional(),
  seasonality_variation: Joi.number().min(0).max(1).optional(),
  has_restrictions: Joi.boolean().optional(),
  selling_price: Joi.number().positive().optional(),
  product_cost: Joi.number().positive().optional(),
  fees: Joi.number().positive().optional(),
  supplier_id: Joi.number().integer().optional(),
});

module.exports = {
  searchProductsSchema,
  processProductDataSchema,
};
