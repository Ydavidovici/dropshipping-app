// backend/tests/scraping/scraperService.test.js

const scraperService = require('../../../modules/scraper/services/scraperService');
const axios = require('axios');
const knex = require('../../../database/knex');
const logger = require('../../../utils/logger');
const { processProductDataSchema } = require('../../../validation/scraperValidation');

// Mock external dependencies
jest.mock('axios');
jest.mock('../../../utils/logger');
jest.mock('../../../database/knex');

describe('Scraper Service', () => {
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

    describe('searchProducts', () => {
        test('should return a list of product URLs based on search parameters', async () => {
            const searchParams = {
                keywords: 'wireless earbuds',
                category: 'electronics',
                min_price: 10,
                max_price: 100,
                limit: 2,
            };

            const mockHtml = `
        <div class="product-item">
          <a class="product-link" href="/product/1">Product 1</a>
        </div>
        <div class="product-item">
          <a class="product-link" href="/product/2">Product 2</a>
        </div>
        <div class="product-item">
          <a class="product-link" href="/product/3">Product 3</a>
        </div>
      `;

            axios.get.mockResolvedValue({ data: mockHtml });

            const productUrls = await scraperService.searchProducts(searchParams);

            expect(axios.get).toHaveBeenCalledWith(
                `https://www.example-ecommerce.com/search?q=wireless%20earbuds&category=electronics&min_price=10&max_price=100`
            );
            expect(productUrls).toEqual([
                'https://www.example-ecommerce.com/product/1',
                'https://www.example-ecommerce.com/product/2',
            ]);
        });

        test('should handle errors during product search', async () => {
            const searchParams = {
                keywords: 'wireless earbuds',
                category: 'electronics',
                min_price: 10,
                max_price: 100,
                limit: 2,
            };

            const mockError = new Error('Network error');
            axios.get.mockRejectedValue(mockError);

            await expect(scraperService.searchProducts(searchParams)).rejects.toThrow('Network error');
            expect(axios.get).toHaveBeenCalledWith(
                `https://www.example-ecommerce.com/search?q=wireless%20earbuds&category=electronics&min_price=10&max_price=100`
            );
            expect(logger.error).toHaveBeenCalledWith(`Error in searchProducts: ${mockError.message}`);
        });
    });

    describe('scrapeProductDetails', () => {
        test('should return cleaned product data when scraping is successful', async () => {
            const productUrl = 'https://www.example-ecommerce.com/product/1';
            const mockHtml = `
        <h1 class="product-title">Wireless Earbuds</h1>
        <div id="searchVolume">1500</div>
        <div id="salesRank">30</div>
        <div id="competitorCount">5</div>
        <div id="shippingCost">$5.00</div>
        <div id="returnRate">0.02</div>
        <div id="seasonalityVariation">0.15</div>
        <div id="restrictions">None</div>
        <div id="sellingPrice">$50.00</div>
        <div id="productCost">$20.00</div>
        <div id="fees">$5.00</div>
      `;

            axios.get.mockResolvedValue({ data: mockHtml });

            const expectedProductData = {
                name: 'Wireless Earbuds',
                search_volume: 1500,
                sales_rank: 30,
                competitor_count: 5,
                shipping_cost: 5.00,
                return_rate: 0.02,
                seasonality_variation: 0.15,
                has_restrictions: false,
                selling_price: 50.00,
                product_cost: 20.00,
                fees: 5.00,
            };

            const productData = await scraperService.scrapeProductDetails(productUrl);

            expect(axios.get).toHaveBeenCalledWith(productUrl);
            expect(productData).toEqual(expectedProductData);
        });

        test('should return null if validation fails', async () => {
            const productUrl = 'https://www.example-ecommerce.com/product/1';
            const mockHtml = `
        <h1 class="product-title"></h1> <!-- Missing name -->
        <div id="searchVolume">invalid_number</div> <!-- Invalid search volume -->
        <div id="salesRank">30</div>
        <div id="competitorCount">5</div>
        <div id="shippingCost">$5.00</div>
        <div id="returnRate">0.02</div>
        <div id="seasonalityVariation">0.15</div>
        <div id="restrictions">None</div>
        <div id="sellingPrice">$50.00</div>
        <div id="productCost">$20.00</div>
        <div id="fees">$5.00</div>
      `;

            axios.get.mockResolvedValue({ data: mockHtml });

            const productData = await scraperService.scrapeProductDetails(productUrl);

            expect(axios.get).toHaveBeenCalledWith(productUrl);
            expect(productData).toBeNull();
            expect(logger.warn).toHaveBeenCalledWith(
                `Validation error for product at ${productUrl}: "name" is not allowed to be empty`
            );
        });

        test('should handle errors during scraping', async () => {
            const productUrl = 'https://www.example-ecommerce.com/product/1';
            const mockError = new Error('Network error');

            axios.get.mockRejectedValue(mockError);

            const productData = await scraperService.scrapeProductDetails(productUrl);

            expect(axios.get).toHaveBeenCalledWith(productUrl);
            expect(productData).toBeNull();
            expect(logger.error).toHaveBeenCalledWith(`Error scraping product details from ${productUrl}: ${mockError.message}`);
        });
    });

    describe('saveProductData', () => {
        test('should insert a new product if it does not exist', async () => {
            const productData = {
                name: 'Wireless Earbuds',
                search_volume: 1500,
                sales_rank: 30,
                competitor_count: 5,
                shipping_cost: 5.00,
                return_rate: 0.02,
                seasonality_variation: 0.15,
                has_restrictions: false,
                selling_price: 50.00,
                product_cost: 20.00,
                fees: 5.00,
                supplier_id: 1,
            };

            // Mock knex queries
            knex('products').where.mockReturnValue({
                first: jest.fn().mockResolvedValue(null),
            });
            knex('products').insert.mockResolvedValue([{ id: 1, ...productData }]);

            const savedProduct = await scraperService.saveProductData(productData);

            expect(knex('products').where).toHaveBeenCalledWith({ name: 'Wireless Earbuds' });
            expect(knex('products').insert).toHaveBeenCalledWith(productData);
            expect(savedProduct).toEqual({ id: 1, ...productData });
        });

        test('should update and return the product if it already exists', async () => {
            const existingProduct = {
                id: 1,
                name: 'Wireless Earbuds',
                search_volume: 1500,
                sales_rank: 30,
                competitor_count: 5,
                shipping_cost: 5.00,
                return_rate: 0.02,
                seasonality_variation: 0.15,
                has_restrictions: false,
                selling_price: 50.00,
                product_cost: 20.00,
                fees: 5.00,
                supplier_id: 1,
            };

            const updatedData = {
                search_volume: 1600,
                sales_rank: 25,
            };

            const updatedProduct = { ...existingProduct, ...updatedData };

            // Mock knex queries
            knex('products').where.mockReturnValue({
                first: jest.fn().mockResolvedValue(existingProduct),
            });
            knex('products').where().update.mockResolvedValue([updatedProduct]);

            const result = await scraperService.saveProductData(updatedData);

            expect(knex('products').where).toHaveBeenCalledWith({ name: updatedData.name || 'Wireless Earbuds' });
            expect(knex('products').where().update).toHaveBeenCalledWith(updatedData);
            expect(result).toEqual(updatedProduct);
        });

        test('should throw an error if saving fails', async () => {
            const productData = {
                name: 'Wireless Earbuds',
                search_volume: 1500,
                sales_rank: 30,
                competitor_count: 5,
                shipping_cost: 5.00,
                return_rate: 0.02,
                seasonality_variation: 0.15,
                has_restrictions: false,
                selling_price: 50.00,
                product_cost: 20.00,
                fees: 5.00,
                supplier_id: 1,
            };

            // Mock knex queries
            knex('products').where.mockReturnValue({
                first: jest.fn().mockResolvedValue(null),
            });
            knex('products').insert.mockRejectedValue(new Error('Database error'));

            await expect(scraperService.saveProductData(productData)).rejects.toThrow('Database error');
            expect(knex('products').where).toHaveBeenCalledWith({ name: 'Wireless Earbuds' });
            expect(knex('products').insert).toHaveBeenCalledWith(productData);
            expect(logger.error).toHaveBeenCalledWith(`Error saving product data: Database error`);
        });
    });

    describe('searchAndSaveProducts', () => {
        test('should orchestrate search, scrape, and save processes successfully', async () => {
            const searchParams = {
                keywords: 'wireless earbuds',
                category: 'electronics',
                min_price: 10,
                max_price: 100,
                limit: 2,
            };

            const mockProductUrls = [
                'https://www.example-ecommerce.com/product/1',
                'https://www.example-ecommerce.com/product/2',
            ];

            const mockScrapedData1 = {
                name: 'Wireless Earbuds',
                search_volume: 1500,
                sales_rank: 30,
                competitor_count: 5,
                shipping_cost: 5.00,
                return_rate: 0.02,
                seasonality_variation: 0.15,
                has_restrictions: false,
                selling_price: 50.00,
                product_cost: 20.00,
                fees: 5.00,
            };

            const mockScrapedData2 = {
                name: 'Bluetooth Headphones',
                search_volume: 2000,
                sales_rank: 20,
                competitor_count: 10,
                shipping_cost: 7.00,
                return_rate: 0.03,
                seasonality_variation: 0.10,
                has_restrictions: false,
                selling_price: 60.00,
                product_cost: 25.00,
                fees: 6.00,
            };

            const mockSavedProduct1 = { id: 1, ...mockScrapedData1 };
            const mockSavedProduct2 = { id: 2, ...mockScrapedData2 };

            // Mock service functions
            scraperService.searchProducts = jest.fn().mockResolvedValue(mockProductUrls);
            scraperService.scrapeProductDetails = jest.fn()
                .mockResolvedValueOnce(mockScrapedData1)
                .mockResolvedValueOnce(mockScrapedData2);
            scraperService.saveProductData = jest.fn()
                .mockResolvedValueOnce(mockSavedProduct1)
                .mockResolvedValueOnce(mockSavedProduct2);

            const result = await scraperService.searchAndSaveProducts(searchParams);

            expect(scraperService.searchProducts).toHaveBeenCalledWith(searchParams);
            expect(scraperService.scrapeProductDetails).toHaveBeenCalledTimes(2);
            expect(scraperService.scrapeProductDetails).toHaveBeenNthCalledWith(1, mockProductUrls[0]);
            expect(scraperService.scrapeProductDetails).toHaveBeenNthCalledWith(2, mockProductUrls[1]);
            expect(scraperService.saveProductData).toHaveBeenCalledTimes(2);
            expect(scraperService.saveProductData).toHaveBeenNthCalledWith(1, mockScrapedData1);
            expect(scraperService.saveProductData).toHaveBeenNthCalledWith(2, mockScrapedData2);
            expect(result).toEqual([mockSavedProduct1, mockSavedProduct2]);
            expect(logger.info).toHaveBeenCalledWith(`Successfully processed 2 products.`);
        });

        test('should handle errors during the orchestrated process', async () => {
            const searchParams = {
                keywords: 'wireless earbuds',
                category: 'electronics',
                min_price: 10,
                max_price: 100,
                limit: 2,
            };

            const mockProductUrls = [
                'https://www.example-ecommerce.com/product/1',
                'https://www.example-ecommerce.com/product/2',
            ];

            const mockScrapedData1 = {
                name: 'Wireless Earbuds',
                search_volume: 1500,
                sales_rank: 30,
                competitor_count: 5,
                shipping_cost: 5.00,
                return_rate: 0.02,
                seasonality_variation: 0.15,
                has_restrictions: false,
                selling_price: 50.00,
                product_cost: 20.00,
                fees: 5.00,
            };

            // Mock service functions
            scraperService.searchProducts = jest.fn().mockResolvedValue(mockProductUrls);
            scraperService.scrapeProductDetails = jest.fn()
                .mockResolvedValueOnce(mockScrapedData1)
                .mockRejectedValueOnce(new Error('Scraping error'));
            scraperService.saveProductData = jest.fn().mockResolvedValueOnce({ id: 1, ...mockScrapedData1 });

            await expect(scraperService.searchAndSaveProducts(searchParams)).rejects.toThrow('Scraping error');

            expect(scraperService.searchProducts).toHaveBeenCalledWith(searchParams);
            expect(scraperService.scrapeProductDetails).toHaveBeenCalledTimes(2);
            expect(scraperService.scrapeProductDetails).toHaveBeenNthCalledWith(1, mockProductUrls[0]);
            expect(scraperService.scrapeProductDetails).toHaveBeenNthCalledWith(2, mockProductUrls[1]);
            expect(scraperService.saveProductData).toHaveBeenCalledTimes(1);
            expect(scraperService.saveProductData).toHaveBeenCalledWith(mockScrapedData1);
            expect(logger.error).toHaveBeenCalledWith(`Error in searchAndSaveProducts: Scraping error`);
        });
    });
});
