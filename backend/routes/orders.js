// routes/orders.js

const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const validateRequest = require('../middleware/validationMiddleware');
const { createOrderSchema, updateOrderSchema } = require('../validation/orderValidation');

/**
 * @route POST /api/orders
 * @desc Create a new order
 * @access Private (e.g., Customer)
 */
router.post(
  '/',
  authenticate,
  authorize(['customer', 'admin']),
  validateRequest(createOrderSchema),
  orderController.createOrder
);

/**
 * @route GET /api/orders
 * @desc Get all orders
 * @access Private (e.g., Admin)
 */
router.get(
  '/',
  authenticate,
  authorize('admin'),
  orderController.getAllOrders
);

/**
 * @route GET /api/orders/:id
 * @desc Get an order by ID
 * @access Private (e.g., Admin or Owner)
 */
router.get(
  '/:id',
  authenticate,
  authorize(['admin', 'self']),
  orderController.getOrderById
);

/**
 * @route PUT /api/orders/:id
 * @desc Update an order by ID
 * @access Private (e.g., Admin)
 */
router.put(
  '/:id',
  authenticate,
  authorize('admin'),
  validateRequest(updateOrderSchema),
  orderController.updateOrder
);

/**
 * @route DELETE /api/orders/:id
 * @desc Delete an order by ID
 * @access Private (e.g., Admin)
 */
router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  orderController.deleteOrder
);

module.exports = router;
