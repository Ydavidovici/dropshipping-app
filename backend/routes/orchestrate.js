// backend/routes/orchestrate.js

const express = require('express');
const router = express.Router();
const { initiateProductSearch } = require('../orchestrator');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const validateRequest = require('../middleware/validationMiddleware');
const { searchProductsSchema } = require('../validation/scraperValidation');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const logger = require('../utils/logger');

/**
 * @route POST /api/orchestrate/search
 * @desc Initiate product search and scraping workflow
 * @access Private (e.g., Admin or Authorized Users)
 */
router.post(
    '/search',
    authenticate,
    authorize(['admin', 'scraper']), // Define roles as needed
    validateRequest(searchProductsSchema),
    async (req, res) => {
        try {
            const searchParams = req.body;
            const job = await initiateProductSearch(searchParams);
            return successResponse(res, 202, 'Product search initiated.', { jobId: job.id });
        } catch (error) {
            logger.error(`Error in /api/orchestrate/search: ${error.message}`);
            return errorResponse(res, 500, 'Internal Server Error.');
        }
    }
);

module.exports = router;
