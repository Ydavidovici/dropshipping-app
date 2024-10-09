// backend/modules/scoring/routes/highScoringProducts.js

const express = require('express');
const router = express.Router();
const { getHighScoringProducts } = require('../controllers/highScoringProductsController');
const authenticate = require('../../../middleware/authenticate');
const authorize = require('../../../middleware/authorize');

/**
 * @route GET /api/scoring/high-scoring-products
 * @desc Retrieve all high-scoring products
 * @access Private (Admin or Authorized Users)
 */
router.get(
    '/high-scoring-products',
    authenticate,
    authorize(['admin', 'user']), // Define roles as needed
    getHighScoringProducts
);

module.exports = router;
