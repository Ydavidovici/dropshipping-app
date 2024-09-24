// controllers/orderController.js

const Order = require('../models/orderModel');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const logger = require('../utils/logger');

/**
 * Create a new order.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
const createOrder = async (req, res, next) => {
  try {
    const orderData = req.body;
    const userId = req.user.id; // Assuming authentication middleware attaches user info

    // Add user ID to order data
    orderData.user_id = userId;

    const order = await Order.createOrder(orderData);
    logger.info(`Order created: ID ${order.id} by User ID ${userId}`);
    successResponse(res, 201, 'Order created successfully.', { order });
  } catch (error) {
    logger.error(`Error creating order: ${error.message}`);
    next(error);
  }
};

/**
 * Get all orders.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.getAllOrders();
    successResponse(res, 200, 'Orders retrieved successfully.', { orders });
  } catch (error) {
    logger.error(`Error retrieving orders: ${error.message}`);
    next(error);
  }
};

/**
 * Get an order by ID.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
const getOrderById = async (req, res, next) => {
  try {
    const orderId = req.params.id;
    const userId = req.user.id;
    const userRole = req.user.role;

    const order = await Order.getOrderById(orderId);
    if (!order) {
      return errorResponse(res, 404, 'Order not found.');
    }

    // Authorization: Admins can view all orders; customers can view their own
    if (userRole !== 'admin' && order.user_id !== userId) {
      return errorResponse(res, 403, 'Forbidden: Access denied.');
    }

    successResponse(res, 200, 'Order retrieved successfully.', { order });
  } catch (error) {
    logger.error(`Error retrieving order: ${error.message}`);
    next(error);
  }
};

/**
 * Update an order by ID.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
const updateOrder = async (req, res, next) => {
  try {
    const orderId = req.params.id;
    const updateData = req.body;

    const updatedOrder = await Order.updateOrder(orderId, updateData);
    if (!updatedOrder) {
      return errorResponse(res, 404, 'Order not found.');
    }

    logger.info(`Order updated: ID ${orderId}`);
    successResponse(res, 200, 'Order updated successfully.', { order: updatedOrder });
  } catch (error) {
    logger.error(`Error updating order: ${error.message}`);
    next(error);
  }
};

/**
 * Delete an order by ID.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
const deleteOrder = async (req, res, next) => {
  try {
    const orderId = req.params.id;

    const deleted = await Order.deleteOrder(orderId);
    if (!deleted) {
      return errorResponse(res, 404, 'Order not found.');
    }

    logger.info(`Order deleted: ID ${orderId}`);
    successResponse(res, 200, 'Order deleted successfully.');
  } catch (error) {
    logger.error(`Error deleting order: ${error.message}`);
    next(error);
  }
};

module.exports = {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
};
