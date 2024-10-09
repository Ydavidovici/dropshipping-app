// app.js

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const rateLimiter = require('./middleware/rateLimiter');
const loggerMiddleware = require('./middleware/loggerMiddleware');
const { startWorkers } = require('./workers');

// Swagger dependencies
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');


const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging Middleware
app.use(loggerMiddleware);

// Rate Limiter Middleware
app.use(rateLimiter);

// Swagger Documentation
const swaggerDocument = YAML.load('./swagger.yaml');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// API Routes
app.use('/api', routes);

// Error Handling Middleware (Global)
app.use((err, req, res, next) => {
    logger.error(`Unhandled Error: ${err.message}`);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
});


startWorkers();

// Start the Server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
});

// Graceful Shutdown
const shutdown = async () => {
    logger.info('Shutting down gracefully...');
    server.close(async () => {
        logger.info('HTTP server closed.');
        await coordinatorWorker.close();
        // Close other workers if necessary
        process.exit(0);
    });

    // Force shutdown after 10 seconds
    setTimeout(() => {
        logger.error('Forced shutdown.');
        process.exit(1);
    }, 10000);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);


module.exports = app;
