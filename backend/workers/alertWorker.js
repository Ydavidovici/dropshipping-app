// backend/workers/alertWorker.js

const { Worker } = require('bullmq');
const AlertService = require('../modules/alerts/services/alertService');
const logger = require('../utils/logger');

const alertWorker = new Worker('alert', async job => {
    const { alertData } = job.data;
    try {
        // Process the alert
        await AlertService.processAlert(alertData);
        logger.info(`Processed alert ID ${alertData.alertId} for user ID ${alertData.userId}`);
    } catch (error) {
        logger.error(`Error in alertWorker: ${error.message}`);
        throw error;
    }
}, {
    connection: {
        host: '127.0.0.1',
        port: 6379,
    },
});

alertWorker.on('completed', job => {
    logger.info(`Alert job completed: ${job.id}`);
});

alertWorker.on('failed', (job, err) => {
    logger.error(`Alert job failed: ${job.id}, Error: ${err.message}`);
});

module.exports = alertWorker;
