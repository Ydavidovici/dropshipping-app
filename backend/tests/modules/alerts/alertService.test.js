// backend/tests/alerts/alertService.test.js

const alertService = require('../../../modules/alerts/services/alertService');
const alertModel = require('../../../modules/alerts/models/alertModel');
const knex = require('../../../database/knex');
const logger = require('../../../utils/logger');

// Mock the alertModel functions
jest.mock('../../../modules/alerts/models/alertModel');
jest.mock('../../../utils/logger');

describe('Alerts Service', () => {
    beforeAll(async () => {
        // Run migrations and seed the database if necessary
        await knex.migrate.rollback();
        await knex.migrate.latest();
        // Seed data if required
    });

    afterAll(async () => {
        await knex.migrate.rollback();
        await knex.destroy();
    });

    describe('createNewAlert', () => {
        test('should create and return a new alert', async () => {
            const userId = 1;
            const alertData = {
                product_id: 1,
                condition_type: 'price_drop',
                threshold: 15.00,
                notification_method: 'email',
                active: true,
            };

            const mockAlert = { id: 1, user_id: userId, ...alertData };
            alertModel.createAlert.mockResolvedValue(mockAlert);

            const result = await alertService.createNewAlert(userId, alertData);

            expect(alertModel.createAlert).toHaveBeenCalledWith({
                user_id: userId,
                ...alertData,
            });
            expect(result).toEqual(mockAlert);
        });

        test('should throw an error if alert creation fails', async () => {
            const userId = 1;
            const alertData = {
                product_id: 1,
                condition_type: 'price_drop',
                threshold: 15.00,
                notification_method: 'email',
                active: true,
            };

            const mockError = new Error('Database error');
            alertModel.createAlert.mockRejectedValue(mockError);

            await expect(alertService.createNewAlert(userId, alertData)).rejects.toThrow('Database error');
            expect(alertModel.createAlert).toHaveBeenCalledWith({
                user_id: userId,
                ...alertData,
            });
            expect(logger.error).toHaveBeenCalledWith(`Error in createNewAlert: ${mockError.message}`);
        });
    });

    describe('getUserAlerts', () => {
        test('should retrieve all alerts for a user', async () => {
            const userId = 1;
            const mockAlerts = [
                { id: 1, user_id: userId, product_id: 1, condition_type: 'price_drop', threshold: 15.00, notification_method: 'email', active: true },
                { id: 2, user_id: userId, product_id: 2, condition_type: 'stock_low', threshold: 5, notification_method: 'sms', active: true },
            ];

            alertModel.getAlertsByUserId.mockResolvedValue(mockAlerts);

            const result = await alertService.getUserAlerts(userId);

            expect(alertModel.getAlertsByUserId).toHaveBeenCalledWith(userId);
            expect(result).toEqual(mockAlerts);
        });

        test('should throw an error if retrieval fails', async () => {
            const userId = 1;
            const mockError = new Error('Database error');
            alertModel.getAlertsByUserId.mockRejectedValue(mockError);

            await expect(alertService.getUserAlerts(userId)).rejects.toThrow('Database error');
            expect(alertModel.getAlertsByUserId).toHaveBeenCalledWith(userId);
            expect(logger.error).toHaveBeenCalledWith(`Error in getUserAlerts: ${mockError.message}`);
        });
    });

    describe('getAlert', () => {
        test('should retrieve a specific alert if it belongs to the user', async () => {
            const userId = 1;
            const alertId = 1;
            const mockAlert = { id: alertId, user_id: userId, product_id: 1, condition_type: 'price_drop', threshold: 15.00, notification_method: 'email', active: true };

            alertModel.getAlertById.mockResolvedValue(mockAlert);

            const result = await alertService.getAlert(userId, alertId);

            expect(alertModel.getAlertById).toHaveBeenCalledWith(alertId);
            expect(result).toEqual(mockAlert);
        });

        test('should throw an error if alert does not belong to the user', async () => {
            const userId = 1;
            const alertId = 2;
            const mockAlert = { id: alertId, user_id: 2, product_id: 1, condition_type: 'price_drop', threshold: 15.00, notification_method: 'email', active: true };

            alertModel.getAlertById.mockResolvedValue(mockAlert);

            await expect(alertService.getAlert(userId, alertId)).rejects.toThrow('Unauthorized access to the alert.');
            expect(alertModel.getAlertById).toHaveBeenCalledWith(alertId);
            expect(logger.error).toHaveBeenCalledWith(`Error in getAlert: Unauthorized access to the alert.`);
        });

        test('should return null if alert is not found', async () => {
            const userId = 1;
            const alertId = 999;

            alertModel.getAlertById.mockResolvedValue(null);

            const result = await alertService.getAlert(userId, alertId);

            expect(alertModel.getAlertById).toHaveBeenCalledWith(alertId);
            expect(result).toBeNull();
        });

        test('should throw an error if retrieval fails', async () => {
            const userId = 1;
            const alertId = 1;
            const mockError = new Error('Database error');

            alertModel.getAlertById.mockRejectedValue(mockError);

            await expect(alertService.getAlert(userId, alertId)).rejects.toThrow('Database error');
            expect(alertModel.getAlertById).toHaveBeenCalledWith(alertId);
            expect(logger.error).toHaveBeenCalledWith(`Error in getAlert: ${mockError.message}`);
        });
    });

    describe('updateExistingAlert', () => {
        test('should update and return the alert if it belongs to the user', async () => {
            const userId = 1;
            const alertId = 1;
            const updateData = { threshold: 20.00, active: false };
            const mockExistingAlert = { id: alertId, user_id: userId, product_id: 1, condition_type: 'price_drop', threshold: 15.00, notification_method: 'email', active: true };
            const mockUpdatedAlert = { ...mockExistingAlert, ...updateData };

            alertModel.getAlertById.mockResolvedValue(mockExistingAlert);
            alertModel.updateAlert.mockResolvedValue([mockUpdatedAlert]);

            const result = await alertService.updateExistingAlert(userId, alertId, updateData);

            expect(alertModel.getAlertById).toHaveBeenCalledWith(alertId);
            expect(alertModel.updateAlert).toHaveBeenCalledWith(alertId, updateData);
            expect(result).toEqual(mockUpdatedAlert);
        });

        test('should throw an error if alert does not belong to the user', async () => {
            const userId = 1;
            const alertId = 2;
            const updateData = { threshold: 20.00, active: false };
            const mockExistingAlert = { id: alertId, user_id: 2, product_id: 1, condition_type: 'price_drop', threshold: 15.00, notification_method: 'email', active: true };

            alertModel.getAlertById.mockResolvedValue(mockExistingAlert);

            await expect(alertService.updateExistingAlert(userId, alertId, updateData)).rejects.toThrow('Unauthorized access to update the alert.');
            expect(alertModel.getAlertById).toHaveBeenCalledWith(alertId);
            expect(alertModel.updateAlert).not.toHaveBeenCalled();
            expect(logger.error).toHaveBeenCalledWith(`Error in updateExistingAlert: Unauthorized access to update the alert.`);
        });

        test('should return null if alert is not found', async () => {
            const userId = 1;
            const alertId = 999;
            const updateData = { threshold: 20.00, active: false };

            alertModel.getAlertById.mockResolvedValue(null);

            const result = await alertService.updateExistingAlert(userId, alertId, updateData);

            expect(alertModel.getAlertById).toHaveBeenCalledWith(alertId);
            expect(alertModel.updateAlert).not.toHaveBeenCalled();
            expect(result).toBeNull();
        });

        test('should throw an error if update fails', async () => {
            const userId = 1;
            const alertId = 1;
            const updateData = { threshold: 20.00, active: false };
            const mockExistingAlert = { id: alertId, user_id: userId, product_id: 1, condition_type: 'price_drop', threshold: 15.00, notification_method: 'email', active: true };
            const mockError = new Error('Database error');

            alertModel.getAlertById.mockResolvedValue(mockExistingAlert);
            alertModel.updateAlert.mockRejectedValue(mockError);

            await expect(alertService.updateExistingAlert(userId, alertId, updateData)).rejects.toThrow('Database error');
            expect(alertModel.getAlertById).toHaveBeenCalledWith(alertId);
            expect(alertModel.updateAlert).toHaveBeenCalledWith(alertId, updateData);
            expect(logger.error).toHaveBeenCalledWith(`Error in updateExistingAlert: ${mockError.message}`);
        });
    });

    describe('deleteExistingAlert', () => {
        test('should delete and return true if alert belongs to the user', async () => {
            const userId = 1;
            const alertId = 1;
            const mockExistingAlert = { id: alertId, user_id: userId, product_id: 1, condition_type: 'price_drop', threshold: 15.00, notification_method: 'email', active: true };
            const mockDeletedRows = 1;

            alertModel.getAlertById.mockResolvedValue(mockExistingAlert);
            alertModel.deleteAlert.mockResolvedValue(mockDeletedRows);

            const result = await alertService.deleteExistingAlert(userId, alertId);

            expect(alertModel.getAlertById).toHaveBeenCalledWith(alertId);
            expect(alertModel.deleteAlert).toHaveBeenCalledWith(alertId);
            expect(result).toBe(true);
        });

        test('should throw an error if alert does not belong to the user', async () => {
            const userId = 1;
            const alertId = 2;
            const mockExistingAlert = { id: alertId, user_id: 2, product_id: 1, condition_type: 'price_drop', threshold: 15.00, notification_method: 'email', active: true };

            alertModel.getAlertById.mockResolvedValue(mockExistingAlert);

            await expect(alertService.deleteExistingAlert(userId, alertId)).rejects.toThrow('Unauthorized access to delete the alert.');
            expect(alertModel.getAlertById).toHaveBeenCalledWith(alertId);
            expect(alertModel.deleteAlert).not.toHaveBeenCalled();
            expect(logger.error).toHaveBeenCalledWith(`Error in deleteExistingAlert: Unauthorized access to delete the alert.`);
        });

        test('should return false if alert is not found', async () => {
            const userId = 1;
            const alertId = 999;

            alertModel.getAlertById.mockResolvedValue(null);

            const result = await alertService.deleteExistingAlert(userId, alertId);

            expect(alertModel.getAlertById).toHaveBeenCalledWith(alertId);
            expect(alertModel.deleteAlert).not.toHaveBeenCalled();
            expect(result).toBe(false);
        });

        test('should throw an error if deletion fails', async () => {
            const userId = 1;
            const alertId = 1;
            const mockExistingAlert = { id: alertId, user_id: userId, product_id: 1, condition_type: 'price_drop', threshold: 15.00, notification_method: 'email', active: true };
            const mockError = new Error('Database error');

            alertModel.getAlertById.mockResolvedValue(mockExistingAlert);
            alertModel.deleteAlert.mockRejectedValue(mockError);

            await expect(alertService.deleteExistingAlert(userId, alertId)).rejects.toThrow('Database error');
            expect(alertModel.getAlertById).toHaveBeenCalledWith(alertId);
            expect(alertModel.deleteAlert).toHaveBeenCalledWith(alertId);
            expect(logger.error).toHaveBeenCalledWith(`Error in deleteExistingAlert: ${mockError.message}`);
        });
    });
});
