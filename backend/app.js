// app.js

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const rateLimiter = require('./middleware/rateLimiter');
const loggerMiddleware = require('./middleware/loggerMiddleware');

// Swagger dependencies
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

dotenv.config();

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

// Error handling middleware
app.use(errorHandler);

module.exports = app;
