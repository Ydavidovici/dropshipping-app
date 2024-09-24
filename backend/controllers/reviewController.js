// controllers/reviewController.js

const Review = require('../models/reviewModel');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const logger = require('../utils/logger');

/**
 * Create a new review.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
const createReview = async (req, res, next) => {
  try {
    const { product_id, rating, comment } = req.body;
    const userId = req.user.id; // Assuming authentication middleware attaches user info

    const reviewData = {
      product_id,
      user_id: userId,
      rating,
      comment,
    };

    const review = await Review.createReview(reviewData);
    logger.info(`Review created: ID ${review.id} by User ID ${userId} for Product ID ${product_id}`);
    successResponse(res, 201, 'Review created successfully.', { review });
  } catch (error) {
    logger.error(`Error creating review: ${error.message}`);
    next(error);
  }
};

/**
 * Get all reviews.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
const getAllReviews = async (req, res, next) => {
  try {
    const reviews = await Review.getAllReviews();
    successResponse(res, 200, 'Reviews retrieved successfully.', { reviews });
  } catch (error) {
    logger.error(`Error retrieving reviews: ${error.message}`);
    next(error);
  }
};

/**
 * Get a review by ID.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
const getReviewById = async (req, res, next) => {
  try {
    const reviewId = req.params.id;

    const review = await Review.getReviewById(reviewId);
    if (!review) {
      return errorResponse(res, 404, 'Review not found.');
    }

    successResponse(res, 200, 'Review retrieved successfully.', { review });
  } catch (error) {
    logger.error(`Error retrieving review: ${error.message}`);
    next(error);
  }
};

/**
 * Update a review by ID.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
const updateReview = async (req, res, next) => {
  try {
    const reviewId = req.params.id;
    const updateData = req.body;

    // Optionally, verify if the user owns the review or has admin privileges
    const existingReview = await Review.getReviewById(reviewId);
    if (!existingReview) {
      return errorResponse(res, 404, 'Review not found.');
    }

    if (req.user.role !== 'admin' && existingReview.user_id !== req.user.id) {
      return errorResponse(res, 403, 'Forbidden: You can only update your own reviews.');
    }

    const updatedReview = await Review.updateReview(reviewId, updateData);
    if (!updatedReview) {
      return errorResponse(res, 404, 'Review not found.');
    }

    logger.info(`Review updated: ID ${reviewId}`);
    successResponse(res, 200, 'Review updated successfully.', { review: updatedReview });
  } catch (error) {
    logger.error(`Error updating review: ${error.message}`);
    next(error);
  }
};

/**
 * Delete a review by ID.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
const deleteReview = async (req, res, next) => {
  try {
    const reviewId = req.params.id;

    const existingReview = await Review.getReviewById(reviewId);
    if (!existingReview) {
      return errorResponse(res, 404, 'Review not found.');
    }

    if (req.user.role !== 'admin' && existingReview.user_id !== req.user.id) {
      return errorResponse(res, 403, 'Forbidden: You can only delete your own reviews.');
    }

    const deleted = await Review.deleteReview(reviewId);
    if (!deleted) {
      return errorResponse(res, 404, 'Review not found.');
    }

    logger.info(`Review deleted: ID ${reviewId}`);
    successResponse(res, 200, 'Review deleted successfully.');
  } catch (error) {
    logger.error(`Error deleting review: ${error.message}`);
    next(error);
  }
};

module.exports = {
  createReview,
  getAllReviews,
  getReviewById,
  updateReview,
  deleteReview,
};
