// routes/reviews.js

const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const validateRequest = require('../middleware/validationMiddleware');
const { createReviewSchema, updateReviewSchema } = require('../validation/reviewValidation');

/**
 * @route POST /api/reviews
 * @desc Create a new review
 * @access Private (e.g., Customer)
 */
router.post(
  '/',
  authenticate,
  authorize(['customer', 'admin']),
  validateRequest(createReviewSchema),
  reviewController.createReview
);

/**
 * @route GET /api/reviews
 * @desc Get all reviews
 * @access Public
 */
router.get('/', reviewController.getAllReviews);

/**
 * @route GET /api/reviews/:id
 * @desc Get a review by ID
 * @access Public
 */
router.get('/:id', reviewController.getReviewById);

/**
 * @route PUT /api/reviews/:id
 * @desc Update a review by ID
 * @access Private (e.g., Admin or Owner)
 */
router.put(
  '/:id',
  authenticate,
  authorize(['admin', 'self']),
  validateRequest(updateReviewSchema),
  reviewController.updateReview
);

/**
 * @route DELETE /api/reviews/:id
 * @desc Delete a review by ID
 * @access Private (e.g., Admin or Owner)
 */
router.delete(
  '/:id',
  authenticate,
  authorize(['admin', 'self']),
  reviewController.deleteReview
);

module.exports = router;
