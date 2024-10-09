// backend/routes/index.js

const express = require('express');
const router = express.Router();

// Import CRUD Routes
const authRoutes = require('./auth');
const userRoutes = require('./users');
const productRoutes = require('./product');
const orderRoutes = require('./orders');
const reviewRoutes = require('./review');

// Import Alerts Module Routes
const alertsRoutes = require('../modules/alerts/routes/alerts');

// Import Scraper Module Routes
const scraperRoutes = require('../modules/scraper/routes/scraper');

// Import Scoring Module Routes
const scoreRoutes = require('../modules/scoring/routes/score');

// Import Orchestrate Routes
const orchestrateRoutes = require('./orchestrate');

// Use CRUD Routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/reviews', reviewRoutes);

// Use Alerts Routes
router.use('/alerts', alertsRoutes);

// Use Scraper Routes
router.use('/scraper', scraperRoutes);

// Use Scoring Routes
router.use('/scoring', scoreRoutes);

// Use Orchestrate Routes
router.use('/orchestrate', orchestrateRoutes);

module.exports = router;
