// backend/modules/alerts/models/alertModel.js

const knex = require('../../../database/knex'); // Adjust the path based on your project structure
const logger = require('../../../utils/logger');

/**
 * Create a new alert.
 * @param {Object} alertData - Data for the new alert.
 * @returns {Object} - Created alert.
 */
const createAlert = async (alertData) => {
  try {
    const [newAlert] = await knex('alerts')
      .insert(alertData)
      .returning('*');
    return newAlert;
  } catch (error) {
    logger.error(`Error creating alert: ${error.message}`);
    throw error;
  }
};

/**
 * Get all alerts for a specific user.
 * @param {number} userId - ID of the user.
 * @returns {Array} - List of alerts.
 */
const getAlertsByUserId = async (userId) => {
  try {
    const alerts = await knex('alerts').where({ user_id: userId });
    return alerts;
  } catch (error) {
    logger.error(`Error fetching alerts for user ${userId}: ${error.message}`);
    throw error;
  }
};

/**
 * Get a specific alert by ID.
 * @param {number} alertId - ID of the alert.
 * @returns {Object|null} - Alert data or null if not found.
 */
const getAlertById = async (alertId) => {
  try {
    const alert = await knex('alerts').where({ id: alertId }).first();
    return alert || null;
  } catch (error) {
    logger.error(`Error fetching alert ${alertId}: ${error.message}`);
    throw error;
  }
};

/**
 * Update an existing alert.
 * @param {number} alertId - ID of the alert.
 * @param {Object} updateData - Data to update.
 * @returns {Object|null} - Updated alert or null if not found.
 */
const updateAlert = async (alertId, updateData) => {
  try {
    const [updatedAlert] = await knex('alerts')
      .where({ id: alertId })
      .update(updateData)
      .returning('*');
    return updatedAlert || null;
  } catch (error) {
    logger.error(`Error updating alert ${alertId}: ${error.message}`);
    throw error;
  }
};

/**
 * Delete an alert by ID.
 * @param {number} alertId - ID of the alert.
 * @returns {boolean} - True if deleted, false otherwise.
 */
const deleteAlert = async (alertId) => {
  try {
    const deletedRows = await knex('alerts').where({ id: alertId }).del();
    return deletedRows > 0;
  } catch (error) {
    logger.error(`Error deleting alert ${alertId}: ${error.message}`);
    throw error;
  }
};

module.exports = {
  createAlert,
  getAlertsByUserId,
  getAlertById,
  updateAlert,
  deleteAlert,
};
