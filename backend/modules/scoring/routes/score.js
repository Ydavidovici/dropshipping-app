// backend/modules/scoring/routes/score.js

const express = require('express');
const router = express.Router();
const scoreController = require('../controllers/scoreController');
const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');
const validateRequest = require('../../middleware/validationMiddleware');
const { calculateScoreSchema, getScoreSchema } = require('../../validation/scoringValidation');

/**
 * @route POST /api/scoring/calculate
 * @desc Calculate and store the score for a product
 * @access Private (e.g., Admin)
 */
router.post(
  '/calculate',
  authenticate,
  authorize('admin'),
  validateRequest(calculateScoreSchema),
  scoreController.calculateScore
);

/**
 * @route GET /api/scoring/get
 * @desc Get the score for a specific product
 * @access Private (e.g., Admin or Owner)
 */
router.get(
  '/get',
  authenticate,
  authorize(['admin', 'self']),
  validateRequest(getScoreSchema, 'query'),
  scoreController.getScore
);

module.exports = router;
