// backend/workers/index.js

const productSearchWorker = require('./productSearchWorker');
const productScrapeWorker = require('./productScrapeWorker');
const productScoreWorker = require('./productScoreWorker');
const highScoringProductsWorker = require('./highScoringProductsWorker'); // Import
const coordinatorWorker = require('./coordinatorWorker'); // Import
// const alertWorker = require('./alertWorker'); // Uncomment if using alerts
const logger = require('../utils/logger');

const startWorkers = () => {
    logger.info('Starting all workers...');
    // Workers are initialized when required
    // No further action needed here unless you want to handle worker lifecycle
};

module.exports = {
    startWorkers,
};
