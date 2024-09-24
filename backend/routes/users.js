// routes/users.js

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const validateRequest = require('../middleware/validationMiddleware');
const { createUserSchema, updateUserSchema } = require('../validation/userValidation');

/**
 * @route POST /api/users
 * @desc Create a new user
 * @access Private (e.g., Admin)
 */
router.post(
  '/',
  authenticate,
  authorize('admin'),
  validateRequest(createUserSchema),
  userController.createUser
);

/**
 * @route GET /api/users/:id
 * @desc Get a user by ID
 * @access Private (e.g., Admin or Self)
 */
router.get(
  '/:id',
  authenticate,
  authorize(['admin', 'self']),
  userController.getUserById
);

/**
 * @route PUT /api/users/:id
 * @desc Update a user by ID
 * @access Private (e.g., Admin or Self)
 */
router.put(
  '/:id',
  authenticate,
  authorize(['admin', 'self']),
  validateRequest(updateUserSchema),
  userController.updateUser
);

/**
 * @route DELETE /api/users/:id
 * @desc Delete a user by ID
 * @access Private (e.g., Admin)
 */
router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  userController.deleteUser
);

module.exports = router;
