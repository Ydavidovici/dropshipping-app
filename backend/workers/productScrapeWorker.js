// backend/workers/productScrapeWorker.js

const { Worker } = require('bullmq');
const ScraperService = require('../modules/scraper/services/scraperService');
const { productScoreQueue } = require('../queues');
const logger = require('../utils/logger');
const HighScoringProductsModel = require('../modules/scoring/models/highScoringProductsModel');

const productScrapeWorker = new Worker('productScrape', async job => {
    const { productUrl } = job.data;
    try {
        // Scrape product details
        const productDetails = await ScraperService.scrapeProductDetails(productUrl);
        if (!productDetails) {
            logger.warn(`No product details found for URL: ${productUrl}`);
            return;
        }

        // Save product data
        const savedProduct = await ScraperService.saveProductData(productDetails);
        logger.info(`Saved product: ${savedProduct.name} (ID: ${savedProduct.id})`);

        // Enqueue scoring job
        await productScoreQueue.add('scoreProduct', { productId: savedProduct.id }, {
            attempts: 3,
            backoff: {
                type: 'exponential',
                delay: 1000,
            },
        });
    } catch (error) {
        logger.error(`Error in productScrapeWorker: ${error.message}`);
        throw error;
    }
}, {
    connection: {
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: process.env.REDIS_PORT || 6379,
    },
    concurrency: 5,
    limiter: {
        max: 100, // Max 100 jobs
        duration: 60000, // Per 60 seconds
    }
});

productScrapeWorker.on('completed', job => {
    logger.info(`Product scrape job completed: ${job.id}`);
});

productScrapeWorker.on('failed', (job, err) => {
    logger.error(`Product scrape job failed: ${job.id}, Error: ${err.message}`);
});

module.exports = productScrapeWorker;
