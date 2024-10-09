// backend/workers/highScoringProductsWorker.js

const { Worker } = require('bullmq');
const knex = require('../database/knex');
const logger = require('../utils/logger');
const NotificationService = require('../utils/notificationService');

const highScoringProductsWorker = new Worker('highScoringProducts', async job => {
    const { productId, score } = job.data;
    try {
        // Retrieve product details
        const product = await knex('products').where({ id: productId }).first();
        if (!product) {
            logger.warn(`High-Scoring Products Worker: Product ID ${productId} not found.`);
            return;
        }

        // Retrieve users who have set alerts for this product
        const alerts = await knex('alerts').where({ product_id: productId, active: true }).select('*');

        for (const alert of alerts) {
            // Send notification to each user associated with the alert
            await NotificationService.sendHighScoreNotification(alert.user_id, { ...product, score });
        }

        logger.info(`High-Scoring Products Worker: Notified ${alerts.length} users about product ID ${productId}.`);
    } catch (error) {
        logger.error(`Error in highScoringProductsWorker: ${error.message}`);
        throw error;
    }
}, {
    connection: {
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: process.env.REDIS_PORT || 6379,
    },
    concurrency: 5,
});

highScoringProductsWorker.on('completed', job => {
    logger.info(`High-Scoring Products job completed: ${job.id}`);
});

highScoringProductsWorker.on('failed', (job, err) => {
    logger.error(`High-Scoring Products job failed: ${job.id}, Error: ${err.message}`);
});

module.exports = highScoringProductsWorker;
