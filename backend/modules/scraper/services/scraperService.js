// backend/modules/scraper/services/scraperService.js

const axios = require('axios');
const cheerio = require('cheerio');
const knex = require('../../../database/knex');
const { processProductDataSchema } = require('../../../validation/scraperValidation');
const logger = require('../../../utils/logger');

const ScraperService = {
  /**
   * Search for products based on keywords and other filters.
   * @param {Object} searchParams - Parameters for searching products.
   * @returns {Array} - List of product URLs or identifiers.
   */
  searchProducts: async (searchParams) => {
    try {
      const { keywords, category, min_price, max_price, limit } = searchParams;
      // Example: Search on Amazon
      // Note: Scraping Amazon violates their terms of service. Consider using their API or authorized services.
      // This is a placeholder implementation.

      const searchUrl = `https://www.example-ecommerce.com/search?q=${encodeURIComponent(keywords)}&category=${encodeURIComponent(category || '')}&min_price=${min_price || ''}&max_price=${max_price || ''}`;
      const { data } = await axios.get(searchUrl);
      const $ = cheerio.load(data);

      const productLinks = [];
      $('.product-item a.product-link').each((index, element) => {
        if (index < limit) {
          const link = $(element).attr('href');
          productLinks.push(`https://www.example-ecommerce.com${link}`);
        }
      });

      logger.info(`Found ${productLinks.length} products for keywords "${keywords}"`);
      return productLinks;
    } catch (error) {
      logger.error(`Error in searchProducts: ${error.message}`);
      throw error;
    }
  },

  /**
   * Scrape product details from a product URL.
   * @param {string} productUrl - URL of the product page.
   * @returns {Object} - Scraped product data.
   */
  scrapeProductDetails: async (productUrl) => {
    try {
      const { data } = await axios.get(productUrl);
      const $ = cheerio.load(data);

      // Example selectors; adjust based on the actual website's structure
      const name = $('h1.product-title').text().trim();
      const search_volume = parseInt($('#searchVolume').text().replace(/[^0-9]/g, ''), 10) || 0;
      const sales_rank = parseInt($('#salesRank').text().replace(/[^0-9]/g, ''), 10) || 0;
      const competitor_count = parseInt($('#competitorCount').text().replace(/[^0-9]/g, ''), 10) || 0;
      const shipping_cost = parseFloat($('#shippingCost').text().replace(/[^0-9.]/g, '')) || 0.00;
      const return_rate = parseFloat($('#returnRate').text().replace(/[^0-9.]/g, '')) || 0.00;
      const seasonality_variation = parseFloat($('#seasonalityVariation').text().replace(/[^0-9.]/g, '')) || 0.00;
      const has_restrictions = $('#restrictions').text().toLowerCase() === 'none' ? false : true;
      const selling_price = parseFloat($('#sellingPrice').text().replace(/[^0-9.]/g, '')) || 0.00;
      const product_cost = parseFloat($('#productCost').text().replace(/[^0-9.]/g, '')) || 0.00;
      const fees = parseFloat($('#fees').text().replace(/[^0-9.]/g, '')) || 0.00;

      const productData = {
        name,
        search_volume,
        sales_rank,
        competitor_count,
        shipping_cost,
        return_rate,
        seasonality_variation,
        has_restrictions,
        selling_price,
        product_cost,
        fees,
        // supplier_id can be linked based on your supplier logic
      };

      // Validate and process data
      const { error, value } = processProductDataSchema.validate(productData);
      if (error) {
        logger.warn(`Validation error for product at ${productUrl}: ${error.message}`);
        return null;
      }

      return value;
    } catch (error) {
      logger.error(`Error scraping product details from ${productUrl}: ${error.message}`);
      return null;
    }
  },

  /**
   * Save or update product data in the database.
   * @param {Object} productData - Cleaned and processed product data.
   * @returns {Object} - Saved or updated product record.
   */
  saveProductData: async (productData) => {
    try {
      const existingProduct = await knex('products').where({ name: productData.name }).first();

      if (existingProduct) {
        // Update existing product
        const updatedProduct = await knex('products')
          .where({ id: existingProduct.id })
          .update(productData)
          .returning('*');
        return updatedProduct[0];
      } else {
        // Insert new product
        const [newProduct] = await knex('products')
          .insert(productData)
          .returning('*');
        return newProduct;
      }
    } catch (error) {
      logger.error(`Error saving product data: ${error.message}`);
      throw error;
    }
  },

  /**
   * Orchestrate the product search, scraper, and saving process.
   * @param {Object} searchParams - Parameters for searching products.
   * @returns {Array} - List of saved or updated products.
   */
  searchAndSaveProducts: async (searchParams) => {
    try {
      const productUrls = await ScraperService.searchProducts(searchParams);
      const products = [];

      for (const url of productUrls) {
        const productDetails = await ScraperService.scrapeProductDetails(url);
        if (productDetails) {
          const savedProduct = await ScraperService.saveProductData(productDetails);
          products.push(savedProduct);
        }
      }

      logger.info(`Successfully processed ${products.length} products.`);
      return products;
    } catch (error) {
      logger.error(`Error in searchAndSaveProducts: ${error.message}`);
      throw error;
    }
  },
};

module.exports = ScraperService;
