// validation/scoringValidation.js

const Joi = require('joi');

const calculateScoreSchema = Joi.object({
  product_id: Joi.number().integer().required(),
  // Optionally, include parameters to customize the scoring process
  weights: Joi.object({
    demand: Joi.number().min(0).max(1).optional(),
    competition: Joi.number().min(0).max(1).optional(),
    profit_margin: Joi.number().min(0).max(1).optional(),
    supplier_reliability: Joi.number().min(0).max(1).optional(),
    shipping_handling: Joi.number().min(0).max(1).optional(),
    return_rate: Joi.number().min(0).max(1).optional(),
    seasonality: Joi.number().min(0).max(1).optional(),
    product_restrictions: Joi.number().min(0).max(1).optional(),
  }).optional(),
});

module.exports = {
  calculateScoreSchema,
};
