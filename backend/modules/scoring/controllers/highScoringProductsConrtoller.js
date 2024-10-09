// backend/modules/scoring/controllers/highScoringProductsController.js

const HighScoringProductsModel = require('../models/highScoringProductsModel');
const knex = require('../../../database/knex');
const { successResponse, errorResponse } = require('../../../utils/apiResponse');
const logger = require('../../../utils/logger');

/**
 * Get all high-scoring products.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
const getHighScoringProducts = async (req, res) => {
    try {
        const highScoringProducts = await knex('high_scoring_products')
            .join('products', 'high_scoring_products.product_id', 'products.id')
            .select('products.*', 'high_scoring_products.score');

        return successResponse(res, 200, 'High-scoring products retrieved successfully.', { highScoringProducts });
    } catch (error) {
        logger.error(`Error in getHighScoringProducts: ${error.message}`);
        return errorResponse(res, 500, 'Internal Server Error.');
    }
};

module.exports = {
    getHighScoringProducts,
};
