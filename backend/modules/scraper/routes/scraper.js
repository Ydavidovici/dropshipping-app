// backend/modules/scraper/routes/scraper.js

const express = require('express');
const router = express.Router();
const scraperController = require('../controllers/scraperController');
const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');
const validateRequest = require('../../middleware/validationMiddleware');
const { searchProductsSchema } = require('../../validation/scraperValidation');

/**
 * @route POST /api/scraper/trigger
 * @desc Trigger the scraper process manually with custom search parameters
 * @access Private (e.g., Admin or Authorized Users)
 */
router.post(
  '/trigger',
  authenticate,
  authorize(['admin', 'scraper']), // Define roles as needed
  validateRequest(searchProductsSchema),
  scraperController.triggerScraping
);

module.exports = router;
