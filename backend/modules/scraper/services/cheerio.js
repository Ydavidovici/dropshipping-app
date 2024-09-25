// backend/modules/scraper/services/cheerio.js

const cheerio = require('cheerio');
const logger = require('../../../utils/logger');

/**
 * Extract text based on a selector and clean it.
 * @param {string} html - HTML content.
 * @param {string} selector - Cheerio selector.
 * @returns {string} - Cleaned text.
 */
const extractText = (html, selector) => {
  try {
    const $ = cheerio.load(html);
    return $(selector).text().trim();
  } catch (error) {
    logger.error(`Error extracting text with selector ${selector}: ${error.message}`);
    return '';
  }
};

/**
 * Extract attribute based on a selector.
 * @param {string} html - HTML content.
 * @param {string} selector - Cheerio selector.
 * @param {string} attribute - Attribute name to extract.
 * @returns {string} - Attribute value.
 */
const extractAttribute = (html, selector, attribute) => {
  try {
    const $ = cheerio.load(html);
    return $(selector).attr(attribute) || '';
  } catch (error) {
    logger.error(`Error extracting attribute ${attribute} with selector ${selector}: ${error.message}`);
    return '';
  }
};

module.exports = {
  extractText,
  extractAttribute,
};
