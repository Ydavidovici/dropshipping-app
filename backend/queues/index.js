// backend/queues/index.js

const { Queue } = require('bullmq');
const redisConfig = {
    connection: {
        host: '127.0.0.1',
        port: 6379,
    },
};

// Define queues for different tasks
const productSearchQueue = new Queue('productSearch', redisConfig);
const productScrapeQueue = new Queue('productScrape', redisConfig);
const productScoreQueue = new Queue('productScore', redisConfig);
const alertQueue = new Queue('alert', redisConfig);

module.exports = {
    productSearchQueue,
    productScrapeQueue,
    productScoreQueue,
    alertQueue,
};
