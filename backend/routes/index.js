// backend/routes/index.js

const express = require('express');
const router = express.Router();

// Import CRUD Routes
const authRoutes = require('./auth');
const userRoutes = require('./users');
const productRoutes = require('./product');
const orderRoutes = require('./orders');
const reviewRoutes = require('./review');

// Import Scoring Module Routes
const scoreRoutes = require('../modules/scoring/routes/score');

// Use CRUD Routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/reviews', reviewRoutes);

// Use Scoring Routes
router.use('/scoring', scoreRoutes);

module.exports = router;
