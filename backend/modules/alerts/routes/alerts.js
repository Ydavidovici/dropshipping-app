// backend/modules/alerts/routes/alerts.js

const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alertController');
const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');
const validateRequest = require('../../middleware/validationMiddleware');
const { createAlertSchema, updateAlertSchema, getAlertSchema, deleteAlertSchema } = require('../../validation/alertsValidation');

/**
 * @route POST /api/alerts
 * @desc Create a new alert
 * @access Private (e.g., Authenticated Users)
 */
router.post(
  '/',
  authenticate,
  validateRequest(createAlertSchema),
  alertController.createAlert
);

/**
 * @route GET /api/alerts
 * @desc Get all alerts for the authenticated user
 * @access Private (e.g., Authenticated Users)
 */
router.get(
  '/',
  authenticate,
  alertController.getUserAlerts
);

/**
 * @route GET /api/alerts/:alert_id
 * @desc Get a specific alert by ID
 * @access Private (e.g., Authenticated Users)
 */
router.get(
  '/:alert_id',
  authenticate,
  validateRequest(getAlertSchema, 'params'),
  alertController.getAlert
);

/**
 * @route PUT /api/alerts/:alert_id
 * @desc Update a specific alert by ID
 * @access Private (e.g., Authenticated Users)
 */
router.put(
  '/:alert_id',
  authenticate,
  validateRequest(updateAlertSchema),
  alertController.updateAlert
);

/**
 * @route DELETE /api/alerts/:alert_id
 * @desc Delete a specific alert by ID
 * @access Private (e.g., Authenticated Users)
 */
router.delete(
  '/:alert_id',
  authenticate,
  validateRequest(deleteAlertSchema, 'params'),
  alertController.deleteAlert
);

module.exports = router;
