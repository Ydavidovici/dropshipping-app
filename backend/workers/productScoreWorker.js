// backend/workers/productScoreWorker.js

const { Worker } = require('bullmq');
const ScoringAlgorithm = require('../modules/scoring/services/scoringAlgorithm');
const scoringModel = require('../modules/scoring/models/scoringModel'); // Ensure this exists
const HighScoringProductsModel = require('../modules/scoring/models/highScoringProductsModel'); // Ensure this exists
const { alertQueue } = require('../queues'); // Import alertQueue appropriately
const logger = require('../utils/logger');
const knex = require('../database/knex');

const scoreThreshold = 60; // Define the threshold here or make it configurable via environment variables

const productScoreWorker = new Worker('productScore', async job => {
    const { productId } = job.data;
    try {
        // Retrieve product data from the database
        const product = await knex('products').where({ id: productId }).first();
        if (!product) {
            logger.warn(`Product with ID ${productId} not found for scoring.`);
            return;
        }

        // Retrieve dataset statistics (implement getDatasetStats appropriately)
        const datasetStats = await ScoringAlgorithm.getDatasetStats(); // Ensure this method exists

        // Perform scoring using the updated scoring algorithm
        const { scores, finalScore } = await ScoringAlgorithm.scoreProduct(product, datasetStats);

        // Save the score to the database
        await scoringModel.saveScore({
            product_id: productId,
            scores,
            final_score: finalScore,
        });

        logger.info(`Scored product ID ${productId} with final score ${finalScore}`);

        // If the product meets the threshold, add it to high-scoring products
        if (finalScore >= scoreThreshold) {
            await HighScoringProductsModel.addHighScoringProduct(productId, finalScore);
            logger.info(`Product ID ${productId} added to high-scoring products.`);

            // Enqueue for further processing (e.g., notifications)
            await alertQueue.add('processAlert', {
                productId,
                score: finalScore,
            });
        }

        // Optionally trigger alerts based on scoring results
        // (Already enqueued above if needed)

    } catch (error) {
        logger.error(`Error in productScoreWorker: ${error.message}`);
        throw error;
    }
}, {
    connection: {
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: process.env.REDIS_PORT || 6379,
    },
    concurrency: 5, // Adjust based on your system's capacity
});

productScoreWorker.on('completed', job => {
    logger.info(`Product score job completed: ${job.id}`);
});

productScoreWorker.on('failed', (job, err) => {
    logger.error(`Product score job failed: ${job.id}, Error: ${err.message}`);
});

module.exports = productScoreWorker;
