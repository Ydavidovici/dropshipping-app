// backend/modules/alerts/services/alertService.js

const alertModel = require('../models/alertModel');
const logger = require('../../../utils/logger');

/**
 * Create a new alert for a user.
 * @param {number} userId - ID of the user creating the alert.
 * @param {Object} alertData - Data for the new alert.
 * @returns {Object} - Created alert.
 */
const createNewAlert = async (userId, alertData) => {
  try {
    const newAlert = await alertModel.createAlert({
      user_id: userId,
      ...alertData,
    });
    return newAlert;
  } catch (error) {
    logger.error(`Error in createNewAlert: ${error.message}`);
    throw error;
  }
};

/**
 * Retrieve all alerts for a specific user.
 * @param {number} userId - ID of the user.
 * @returns {Array} - List of alerts.
 */
const getUserAlerts = async (userId) => {
  try {
    const alerts = await alertModel.getAlertsByUserId(userId);
    return alerts;
  } catch (error) {
    logger.error(`Error in getUserAlerts: ${error.message}`);
    throw error;
  }
};

/**
 * Retrieve a specific alert by ID.
 * @param {number} userId - ID of the user (for authorization).
 * @param {number} alertId - ID of the alert.
 * @returns {Object|null} - Alert data or null if not found.
 */
const getAlert = async (userId, alertId) => {
  try {
    const alert = await alertModel.getAlertById(alertId);
    if (!alert) {
      return null;
    }
    // Ensure the alert belongs to the user
    if (alert.user_id !== userId) {
      throw new Error('Unauthorized access to the alert.');
    }
    return alert;
  } catch (error) {
    logger.error(`Error in getAlert: ${error.message}`);
    throw error;
  }
};

/**
 * Update an existing alert.
 * @param {number} userId - ID of the user (for authorization).
 * @param {number} alertId - ID of the alert.
 * @param {Object} updateData - Data to update.
 * @returns {Object|null} - Updated alert or null if not found.
 */
const updateExistingAlert = async (userId, alertId, updateData) => {
  try {
    const alert = await alertModel.getAlertById(alertId);
    if (!alert) {
      return null;
    }
    // Ensure the alert belongs to the user
    if (alert.user_id !== userId) {
      throw new Error('Unauthorized access to update the alert.');
    }
    const updatedAlert = await alertModel.updateAlert(alertId, updateData);
    return updatedAlert;
  } catch (error) {
    logger.error(`Error in updateExistingAlert: ${error.message}`);
    throw error;
  }
};

/**
 * Delete an alert by ID.
 * @param {number} userId - ID of the user (for authorization).
 * @param {number} alertId - ID of the alert.
 * @returns {boolean} - True if deleted, false otherwise.
 */
const deleteExistingAlert = async (userId, alertId) => {
  try {
    const alert = await alertModel.getAlertById(alertId);
    if (!alert) {
      return false;
    }
    // Ensure the alert belongs to the user
    if (alert.user_id !== userId) {
      throw new Error('Unauthorized access to delete the alert.');
    }
    const deleted = await alertModel.deleteAlert(alertId);
    return deleted;
  } catch (error) {
    logger.error(`Error in deleteExistingAlert: ${error.message}`);
    throw error;
  }
};

module.exports = {
  createNewAlert,
  getUserAlerts,
  getAlert,
  updateExistingAlert,
  deleteExistingAlert,
};
