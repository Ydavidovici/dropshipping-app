// backend/modules/scraper/discovery/discovery.js

const sources = require('./sources');
const ScraperService = require('../services/scraperService');
const logger = require('../../../utils/logger');

/**
 * Discover and scrape products from all defined sources.
 * @param {Object} searchParams - Parameters for searching products.
 * @returns {Array} - List of scraped products.
 */
const discoverAndScrapeProducts = async (searchParams) => {
  try {
    const allProducts = [];

    for (const source of sources) {
      logger.info(`Searching products from source: ${source.name}`);

      // Adjust the search parameters based on the source's requirements
      const params = {
        keywords: searchParams.keywords,
        category: searchParams.category,
        min_price: searchParams.min_price,
        max_price: searchParams.max_price,
        limit: searchParams.limit,
      };

      const productUrls = await ScraperService.searchProducts(params);

      for (const url of productUrls) {
        const productDetails = await ScraperService.scrapeProductDetails(url);
        if (productDetails) {
          allProducts.push(productDetails);
        }
      }
    }

    logger.info(`Discovered and scraped ${allProducts.length} products from all sources.`);
    return allProducts;
  } catch (error) {
    logger.error(`Error in discoverAndScrapeProducts: ${error.message}`);
    throw error;
  }
};

module.exports = {
  discoverAndScrapeProducts,
};
