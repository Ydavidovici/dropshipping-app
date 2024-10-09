// backend/utils/notificationService.js

const nodemailer = require('nodemailer');
const logger = require('./logger');

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST, // e.g., smtp.gmail.com
    port: process.env.EMAIL_PORT, // e.g., 587
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

/**
 * Send an email notification about a high-scoring product.
 * @param {number} userId - ID of the user to notify.
 * @param {Object} product - Product details.
 */
const sendHighScoreNotification = async (userId, product) => {
    try {
        // Retrieve user email from the database
        const user = await knex('users').where({ id: userId }).first();
        if (!user) {
            logger.warn(`Notification Service: User ID ${userId} not found.`);
            return;
        }

        const mailOptions = {
            from: process.env.EMAIL_FROM, // sender address
            to: user.email, // list of receivers
            subject: `High-Scoring Product Alert: ${product.name}`,
            text: `Dear ${user.name},\n\nA product you are interested in has achieved a high score of ${product.score}.\n\nProduct Details:\nName: ${product.name}\nPrice: $${product.selling_price}\n\nBest regards,\nYour Dropshipping App Team`,
        };

        await transporter.sendMail(mailOptions);
        logger.info(`Notification sent to user ID ${userId} for product ID ${product.id}.`);
    } catch (error) {
        logger.error(`Error in sendHighScoreNotification: ${error.message}`);
        throw error;
    }
};

module.exports = {
    sendHighScoreNotification,
};
