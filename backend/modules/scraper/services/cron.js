// backend/modules/scraper/services/cron.js

const cron = require('node-cron');
const ScraperService = require('./scraperService');
const logger = require('../../../utils/logger');

/**
 * Schedule a cron job for periodic scraper.
 */
const scheduleScraping = () => {
  // Schedule the job to run every day at midnight
  cron.schedule('0 0 * * *', async () => {
    try {
      logger.info('Cron Job: Starting scheduled product scraper.');

      const searchParams = {
        keywords: 'wireless earbuds', // Example keyword
        category: 'electronics',
        min_price: 10,
        max_price: 100,
        limit: 20,
      };

      const scrapedProducts = await ScraperService.searchAndSaveProducts(searchParams);

      logger.info(`Cron Job: Successfully scraped and saved ${scrapedProducts.length} products.`);
    } catch (error) {
      logger.error(`Cron Job: Error during scheduled scraping - ${error.message}`);
    }
  }, {
    timezone: 'UTC', // Set your desired timezone
  });
};

module.exports = {
  scheduleScraping,
};
