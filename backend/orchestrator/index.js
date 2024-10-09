// backend/orchestrator/index.js

const { productSearchQueue } = require('../queues');
const logger = require('../utils/logger');

/**
 * Initiates a product search workflow.
 * @param {Object} searchParams - Parameters for searching products.
 * @returns {Job} - The enqueued job.
 */
const initiateProductSearch = async (searchParams) => {
    try {
        const job = await productSearchQueue.add('searchProducts', { searchParams });
        logger.info(`Enqueued product search job with ID ${job.id}`);
        return job;
    } catch (error) {
        logger.error(`Error initiating product search: ${error.message}`);
        throw error;
    }
};

module.exports = {
    initiateProductSearch,
};
