// backend/modules/alerts/controllers/alertController.js

const alertService = require('../services/alertService');
const { successResponse, errorResponse } = require('../../../utils/apiResponse');
const logger = require('../../../utils/logger');

/**
 * Create a new alert for a user.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
const createAlert = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming req.user is set by authentication middleware
    const alertData = req.body;

    const newAlert = await alertService.createNewAlert(userId, alertData);

    return successResponse(res, 201, 'Alert created successfully.', { alert: newAlert });
  } catch (error) {
    logger.error(`Error in createAlert controller: ${error.message}`);
    if (error.message.includes('Unauthorized')) {
      return errorResponse(res, 403, error.message);
    }
    return errorResponse(res, 500, 'Internal Server Error.');
  }
};

/**
 * Retrieve all alerts for a user.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
const getUserAlerts = async (req, res) => {
  try {
    const userId = req.user.id;

    const alerts = await alertService.getUserAlerts(userId);

    return successResponse(res, 200, 'Alerts retrieved successfully.', { alerts });
  } catch (error) {
    logger.error(`Error in getUserAlerts controller: ${error.message}`);
    return errorResponse(res, 500, 'Internal Server Error.');
  }
};

/**
 * Retrieve a specific alert by ID.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
const getAlert = async (req, res) => {
  try {
    const userId = req.user.id;
    const { alert_id } = req.query;

    const alert = await alertService.getAlert(userId, alert_id);

    if (!alert) {
      return errorResponse(res, 404, 'Alert not found.');
    }

    return successResponse(res, 200, 'Alert retrieved successfully.', { alert });
  } catch (error) {
    logger.error(`Error in getAlert controller: ${error.message}`);
    if (error.message.includes('Unauthorized')) {
      return errorResponse(res, 403, error.message);
    }
    return errorResponse(res, 500, 'Internal Server Error.');
  }
};

/**
 * Update an existing alert.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
const updateAlert = async (req, res) => {
  try {
    const userId = req.user.id;
    const { alert_id } = req.params;
    const updateData = req.body;

    const updatedAlert = await alertService.updateExistingAlert(userId, alert_id, updateData);

    if (!updatedAlert) {
      return errorResponse(res, 404, 'Alert not found.');
    }

    return successResponse(res, 200, 'Alert updated successfully.', { alert: updatedAlert });
  } catch (error) {
    logger.error(`Error in updateAlert controller: ${error.message}`);
    if (error.message.includes('Unauthorized')) {
      return errorResponse(res, 403, error.message);
    }
    return errorResponse(res, 500, 'Internal Server Error.');
  }
};

/**
 * Delete an existing alert.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
const deleteAlert = async (req, res) => {
  try {
    const userId = req.user.id;
    const { alert_id } = req.params;

    const deleted = await alertService.deleteExistingAlert(userId, alert_id);

    if (!deleted) {
      return errorResponse(res, 404, 'Alert not found.');
    }

    return successResponse(res, 200, 'Alert deleted successfully.', { deleted: true });
  } catch (error) {
    logger.error(`Error in deleteAlert controller: ${error.message}`);
    if (error.message.includes('Unauthorized')) {
      return errorResponse(res, 403, error.message);
    }
    return errorResponse(res, 500, 'Internal Server Error.');
  }
};

module.exports = {
  createAlert,
  getUserAlerts,
  getAlert,
  updateAlert,
  deleteAlert,
};
