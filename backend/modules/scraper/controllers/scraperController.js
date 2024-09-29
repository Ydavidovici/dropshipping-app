// backend/modules/scraper/controllers/scraperController.js

const ScraperService = require('../services/scraperService');
const { discoverAndScrapeProducts } = require('../discovery/discovery');
const { successResponse, errorResponse } = require('../../../utils/apiResponse');
const { searchProductsSchema } = require('../../../validation/scraperValidation');
const logger = require('../../../utils/logger');

/**
 * Trigger scraper based on user-provided search parameters.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
const triggerScraping = async (req, res) => {
  try {
    const searchParams = req.body;

    // Assuming validation middleware is applied in routes
    const scrapedProducts = await discoverAndScrapeProducts(searchParams);

    return successResponse(res, 200, 'Scraping completed successfully.', { products: scrapedProducts });
  } catch (error) {
    logger.error(`Error in triggerScraping controller: ${error.message}`);
    return errorResponse(res, 500, 'Internal Server Error.');
  }
};

module.exports = {
  triggerScraping,
};
