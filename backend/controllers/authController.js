// controllers/authController.js

const User = require('../models/userModel');
const { hashPassword, comparePasswords } = require('../utils/password');
const { generateToken } = require('../utils/jwt');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const logger = require('../utils/logger');

/**
 * Register a new user.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
const register = async (req, res, next) => {
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

    logger.info(`User registered: ${user.email}`);
    successResponse(res, 201, 'User registered successfully.', { user });
  } catch (error) {
    logger.error(`Error registering user: ${error.message}`);
    next(error);
  }
};

/**
 * Login a user.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findUserByEmail(email);
    if (!user) {
      return errorResponse(res, 401, 'Invalid email or password.');
    }

    // Compare passwords
    const isMatch = await comparePasswords(password, user.password_hash);
    if (!isMatch) {
      return errorResponse(res, 401, 'Invalid email or password.');
    }

    // Generate JWT
    const token = generateToken({ id: user.id, role: user.role });

    logger.info(`User logged in: ${user.email}`);
    successResponse(res, 200, 'Login successful.', { token, user });
  } catch (error) {
    logger.error(`Error logging in user: ${error.message}`);
    next(error);
  }
};

module.exports = {
  register,
  login,
};
