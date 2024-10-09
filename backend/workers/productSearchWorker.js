// backend/workers/productSearchWorker.js

const { Worker } = require('bullmq');
const ScraperService = require('../modules/scraper/services/scraperService');
const { productScrapeQueue } = require('../queues');
const logger = require('../utils/logger');

const productSearchWorker = new Worker('productSearch', async job => {
    const { searchParams } = job.data;
    try {
        // Perform product search
        const productUrls = await ScraperService.searchProducts(searchParams);
        logger.info(`Found ${productUrls.length} products for searchParams: ${JSON.stringify(searchParams)}`);

        // Enqueue scrape jobs for each product
        for (const url of productUrls) {
            await productScrapeQueue.add('scrapeProduct', { productUrl: url });
        }
    } catch (error) {
        logger.error(`Error in productSearchWorker: ${error.message}`);
        throw error; // Bull will handle retries based on queue settings
    }
}, {
    connection: {
        host: '127.0.0.1',
        port: 6379,
    },
});

productSearchWorker.on('completed', job => {
    logger.info(`Product search job completed: ${job.id}`);
});

productSearchWorker.on('failed', (job, err) => {
    logger.error(`Product search job failed: ${job.id}, Error: ${err.message}`);
});

module.exports = productSearchWorker;
