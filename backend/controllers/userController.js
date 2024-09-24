// controllers/userController.js

const User = require('../models/userModel');
const { hashPassword } = require('../utils/password');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const logger = require('../utils/logger');

/**
 * Create a new user.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
const createUser = async (req, res, next) => {
  try {
    const { username, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findUserByEmail(email);
    if (existingUser) {
      return errorResponse(res, 400, 'Email already in use.');
    }

    // Hash the password
    const hashedPassword = await hashPassword(password);

    // Create the user
    const user = await User.createUser({
      username,
      email,
      password_hash: hashedPassword,
      role: role || 'customer',
    });

    logger.info(`User created: ${user.email}`);
    successResponse(res, 201, 'User created successfully.', { user });
  } catch (error) {
    logger.error(`Error creating user: ${error.message}`);
    next(error);
  }
};

/**
 * Get a user by ID.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
const getUserById = async (req, res, next) => {
  try {
    const userId = req.params.id;

    const user = await User.findUserById(userId);
    if (!user) {
      return errorResponse(res, 404, 'User not found.');
    }

    successResponse(res, 200, 'User retrieved successfully.', { user });
  } catch (error) {
    logger.error(`Error retrieving user: ${error.message}`);
    next(error);
  }
};

/**
 * Update a user by ID.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
const updateUser = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const updateData = req.body;

    // If password is being updated, hash it
    if (updateData.password) {
      updateData.password_hash = await hashPassword(updateData.password);
      delete updateData.password;
    }

    const updatedUser = await User.updateUser(userId, updateData);
    if (!updatedUser) {
      return errorResponse(res, 404, 'User not found.');
    }

    logger.info(`User updated: ${updatedUser.email}`);
    successResponse(res, 200, 'User updated successfully.', { user: updatedUser });
  } catch (error) {
    logger.error(`Error updating user: ${error.message}`);
    next(error);
  }
};

/**
 * Delete a user by ID.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
const deleteUser = async (req, res, next) => {
  try {
    const userId = req.params.id;

    const deleted = await User.deleteUser(userId);
    if (!deleted) {
      return errorResponse(res, 404, 'User not found.');
    }

    logger.info(`User deleted: ID ${userId}`);
    successResponse(res, 200, 'User deleted successfully.');
  } catch (error) {
    logger.error(`Error deleting user: ${error.message}`);
    next(error);
  }
};

module.exports = {
  createUser,
  getUserById,
  updateUser,
  deleteUser,
};
