// backend/modules/scoring/models/scoringModel.js

const knex = require('../../../database/knex'); // Adjust the path based on your project structure
const logger = require('../../../utils/logger');

/**
 * Get product data by product_id.
 * @param {number} productId - ID of the product.
 * @returns {Object|null} - Product data or null if not found.
 */
const getProductById = async (productId) => {
  try {
    const product = await knex('products').where({ id: productId }).first();
    return product || null;
  } catch (error) {
    logger.error(`Error fetching product data: ${error.message}`);
    throw error;
  }
};

/**
 * Get dataset statistics for normalization.
 * @returns {Object} - Object containing max values for various criteria.
 */
const getDatasetStats = async () => {
  try {
    const [
      maxSearchVolume,
      maxSalesRank,
      maxCompetitorCount,
      maxShippingCost,
      maxReturnRate,
      maxSeasonalityVariation,
    ] = await Promise.all([
      knex('products').max('search_volume as maxSearchVolume').first(),
      knex('products').max('sales_rank as maxSalesRank').first(),
      knex('products').max('competitor_count as maxCompetitorCount').first(),
      knex('products').max('shipping_cost as maxShippingCost').first(),
      knex('products').max('return_rate as maxReturnRate').first(),
      knex('products').max('seasonality_variation as maxSeasonalityVariation').first(),
    ]);

    return {
      maxSearchVolume: maxSearchVolume.maxSearchVolume || 0,
      maxSalesRank: maxSalesRank.maxSalesRank || 1, // Avoid division by zero
      maxCompetitorCount: maxCompetitorCount.maxCompetitorCount || 0,
      maxShippingCost: maxShippingCost.maxShippingCost || 0,
      maxReturnRate: maxReturnRate.maxReturnRate || 0,
      maxSeasonalityVariation: maxSeasonalityVariation.maxSeasonalityVariation || 0,
    };
  } catch (error) {
    logger.error(`Error fetching dataset statistics: ${error.message}`);
    throw error;
  }
};

/**
 * Save the calculated score for a product.
 * @param {Object} scoreData - Data containing scores and final score.
 * @returns {Object} - Saved score record.
 */
const saveScore = async (scoreData) => {
  try {
    const [savedScore] = await knex('product_scores')
      .insert(scoreData)
      .returning('*');
    return savedScore;
  } catch (error) {
    logger.error(`Error saving score: ${error.message}`);
    throw error;
  }
};

/**
 * Get the score for a specific product.
 * @param {number} productId - ID of the product.
 * @returns {Object|null} - Score data or null if not found.
 */
const getScoreByProductId = async (productId) => {
  try {
    const score = await knex('product_scores').where({ product_id: productId }).first();
    return score || null;
  } catch (error) {
    logger.error(`Error fetching score: ${error.message}`);
    throw error;
  }
};

module.exports = {
  getProductById,
  getDatasetStats,
  saveScore,
  getScoreByProductId,
};
