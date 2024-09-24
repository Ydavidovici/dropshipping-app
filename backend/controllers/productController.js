// controllers/productController.js

const Product = require('../models/productModel');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const logger = require('../utils/logger');

/**
 * Create a new product.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
const createProduct = async (req, res, next) => {
  try {
    const productData = req.body;

    const product = await Product.createProduct(productData);
    logger.info(`Product created: ${product.name} (ID: ${product.id})`);
    successResponse(res, 201, 'Product created successfully.', { product });
  } catch (error) {
    logger.error(`Error creating product: ${error.message}`);
    next(error);
  }
};

/**
 * Get all products.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
const getAllProducts = async (req, res, next) => {
  try {
    const products = await Product.getAllProducts();
    successResponse(res, 200, 'Products retrieved successfully.', { products });
  } catch (error) {
    logger.error(`Error retrieving products: ${error.message}`);
    next(error);
  }
};

/**
 * Get a product by ID.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
const getProductById = async (req, res, next) => {
  try {
    const productId = req.params.id;

    const product = await Product.getProductById(productId);
    if (!product) {
      return errorResponse(res, 404, 'Product not found.');
    }

    successResponse(res, 200, 'Product retrieved successfully.', { product });
  } catch (error) {
    logger.error(`Error retrieving product: ${error.message}`);
    next(error);
  }
};

/**
 * Update a product by ID.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
const updateProduct = async (req, res, next) => {
  try {
    const productId = req.params.id;
    const updateData = req.body;

    const updatedProduct = await Product.updateProduct(productId, updateData);
    if (!updatedProduct) {
      return errorResponse(res, 404, 'Product not found.');
    }

    logger.info(`Product updated: ${updatedProduct.name} (ID: ${updatedProduct.id})`);
    successResponse(res, 200, 'Product updated successfully.', { product: updatedProduct });
  } catch (error) {
    logger.error(`Error updating product: ${error.message}`);
    next(error);
  }
};

/**
 * Delete a product by ID.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
const deleteProduct = async (req, res, next) => {
  try {
    const productId = req.params.id;

    const deleted = await Product.deleteProduct(productId);
    if (!deleted) {
      return errorResponse(res, 404, 'Product not found.');
    }

    logger.info(`Product deleted: ID ${productId}`);
    successResponse(res, 200, 'Product deleted successfully.');
  } catch (error) {
    logger.error(`Error deleting product: ${error.message}`);
    next(error);
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
