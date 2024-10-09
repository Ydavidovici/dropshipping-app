// backend/workers/coordinatorWorker.js

const { Worker } = require('bullmq');
const { productSearchQueue, highScoringProductsQueue } = require('../queues');
const logger = require('../utils/logger');
const HighScoringProductsModel = require('../modules/scoring/models/highScoringProductsModel');

const desiredCount = 10; // Number of high-scoring products to collect
const scoreThreshold = 60; // Minimum score required
const maxIterations = 20; // Prevent infinite searching

const coordinatorWorker = new Worker('coordinator', async job => {
    const { searchParams } = job.data;
    let collectedCount = 0;
    let iterations = 0;

    while (collectedCount < desiredCount && iterations < maxIterations) {
        iterations += 1;
        logger.info(`Coordinator iteration ${iterations}: Starting product search.`);

        // Enqueue a product search job
        const searchJob = await productSearchQueue.add('searchProducts', { searchParams });

        // Implement a mechanism to wait until the search job is completed
        // For this example, we'll assume the searchJob completes quickly
        // In a real-world scenario, consider using events or tracking job status

        // Polling mechanism (simple example)
        const waitForJobCompletion = async (jobId, interval = 1000, maxAttempts = 10) => {
            let attempts = 0;
            while (attempts < maxAttempts) {
                const currentJob = await productSearchQueue.getJob(jobId);
                if (!currentJob) {
                    throw new Error(`Job with ID ${jobId} not found.`);
                }
                const state = await currentJob.getState();
                if (state === 'completed') {
                    return;
                } else if (state === 'failed') {
                    throw new Error(`Job ${jobId} failed.`);
                }
                await new Promise(resolve => setTimeout(resolve, interval));
                attempts += 1;
            }
            throw new Error(`Job ${jobId} did not complete within expected time.`);
        };

        try {
            await waitForJobCompletion(searchJob.id);
            logger.info(`Coordinator: Search job ${searchJob.id} completed.`);
        } catch (error) {
            logger.error(`Coordinator: Error waiting for search job completion: ${error.message}`);
            break; // Exit the loop on error
        }

        // Fetch high-scoring products collected so far
        const currentCount = await HighScoringProductsModel.getHighScoringProductsCount();
        collectedCount = currentCount;

        logger.info(`Coordinator: Collected ${collectedCount}/${desiredCount} high-scoring products.`);
    }

    if (collectedCount >= desiredCount) {
        logger.info(`Coordinator: Desired count of high-scoring products (${desiredCount}) achieved.`);
    } else {
        logger.warn(`Coordinator: Reached maximum iterations (${maxIterations}) with ${collectedCount}/${desiredCount} products.`);
    }
}, {
    connection: {
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: process.env.REDIS_PORT || 6379,
    },
});

coordinatorWorker.on('completed', job => {
    logger.info(`Coordinator job completed: ${job.id}`);
});

coordinatorWorker.on('failed', (job, err) => {
    logger.error(`Coordinator job failed: ${job.id}, Error: ${err.message}`);
});

module.exports = coordinatorWorker;
