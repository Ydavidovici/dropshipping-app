// routes/products.js

const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const validateRequest = require('../middleware/validationMiddleware');
const { productSchema } = require('../validation/productValidation');

/**
 * @route POST /api/products
 * @desc Create a new product
 * @access Private (e.g., Admin)
 */
router.post(
  '/',
  authenticate,
  authorize('admin'),
  validateRequest(productSchema),
  productController.createProduct
);

/**
 * @route GET /api/products
 * @desc Get all products
 * @access Public
 */
router.get('/', productController.getAllProducts);

/**
 * @route GET /api/products/:id
 * @desc Get a product by ID
 * @access Public
 */
router.get('/:id', productController.getProductById);

/**
 * @route PUT /api/products/:id
 * @desc Update a product by ID
 * @access Private (e.g., Admin)
 */
router.put(
  '/:id',
  authenticate,
  authorize('admin'),
  validateRequest(productSchema),
  productController.updateProduct
);

/**
 * @route DELETE /api/products/:id
 * @desc Delete a product by ID
 * @access Private (e.g., Admin)
 */
router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  productController.deleteProduct
);

module.exports = router;
