// validation/productValidation.js

const Joi = require('joi');

const productSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  description: Joi.string().max(500).optional(),
  price: Joi.number().positive().required(),
  currency: Joi.string().length(3).required(), // e.g., USD, EUR
  url: Joi.string().uri().required(),
  image_url: Joi.string().uri().optional(),
  category_id: Joi.number().integer().required(),
  shipping_weight: Joi.number().positive().optional(),
  shipping_dimensions: Joi.string().optional(),
  sales_rank: Joi.number().integer().optional(),
  supplier_name: Joi.string().optional(),
  supplier_rating: Joi.number().min(0).max(5).optional(),
  supplier_contact_email: Joi.string().email().optional(),
  supplier_contact_phone: Joi.string().optional(),
  supplier_website: Joi.string().uri().optional(),
});

module.exports = {
  productSchema,
};
