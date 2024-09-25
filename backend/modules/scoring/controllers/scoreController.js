// backend/modules/scoring/controllers/scoreController.js

const ScoringAlgorithm = require('../services/scoringAlgorithm');
const ScoringModel = require('../models/scoringModel');
const { successResponse, errorResponse } = require('../../../utils/apiResponse');
const logger = require('../../../utils/logger');

/**
 * Calculate and store the score for a product.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
const calculateScore = async (req, res) => {
  try {
    const { product_id } = req.body;

    // Fetch product data from the database
    const product = await ScoringModel.getProductById(product_id);
    if (!product) {
      return errorResponse(res, 404, 'Product not found.');
    }

    // Fetch dataset statistics (e.g., max values) from the database
    const datasetStats = await ScoringModel.getDatasetStats();

    // Define weights for each criterion (can be adjusted as needed)
    const weights = {
      demand: 0.25,
      competition: 0.15,
      profitMargin: 0.20,
      supplierReliability: 0.10,
      shippingHandling: 0.10,
      returnRate: 0.10,
      seasonality: 0.05,
      productRestrictions: 0.05,
    };

    // Perform scoring
    const { scores, finalScore } = ScoringAlgorithm.scoreProduct(product, datasetStats, weights);

    // Store the score in the database
    const scoreRecord = await ScoringModel.saveScore({
      product_id,
      demand_score: scores.demand,
      competition_score: scores.competition,
      profit_margin_score: scores.profitMargin,
      supplier_reliability_score: scores.supplierReliability,
      shipping_handling_score: scores.shippingHandling,
      return_rate_score: scores.returnRate,
      seasonality_score: scores.seasonality,
      product_restrictions_score: scores.productRestrictions,
      final_score: finalScore,
    });

    logger.info(`Score calculated and stored for product ID ${product_id}`);

    return successResponse(res, 200, 'Product score calculated successfully.', { score: scoreRecord });
  } catch (error) {
    logger.error(`Error in calculateScore controller: ${error.message}`);
    return errorResponse(res, 500, 'Internal Server Error.');
  }
};

/**
 * Retrieve the score for a specific product.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
const getScore = async (req, res) => {
  try {
    const { product_id } = req.query;

    // Fetch the score from the database
    const score = await ScoringModel.getScoreByProductId(product_id);
    if (!score) {
      return errorResponse(res, 404, 'Score not found for the specified product.');
    }

    return successResponse(res, 200, 'Product score retrieved successfully.', { score });
  } catch (error) {
    logger.error(`Error in getScore controller: ${error.message}`);
    return errorResponse(res, 500, 'Internal Server Error.');
  }
};

module.exports = {
  calculateScore,
  getScore,
};
