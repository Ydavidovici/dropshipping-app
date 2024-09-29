// backend/tests/scraping/scraperController.test.js

const request = require('supertest');
const express = require('express');
const knex = require('../../../database/knex'); // Adjust the path as needed
const scraperRoutes = require('../../../modules/scraper/routes/scraper');
const authenticate = require('../../../middleware/authenticate');
const authorize = require('../../../middleware/authorize');
const axios = require('axios');
const cheerio = require('../../../modules/scraper/services/cheerio'); // Adjust path if needed

// Mock middlewares
jest.mock('../../../middleware/authenticate');
jest.mock('../../../middleware/authorize');

// Mock external dependencies
jest.mock('axios');

const app = express();
app.use(express.json());

// Mock Authentication Middleware to always pass and set req.user
authenticate.mockImplementation((req, res, next) => {
    req.user = { id: 1 }; // Mocked authenticated user with id=1
    next();
});

// Mock Authorization Middleware to always pass
authorize.mockImplementation(() => (req, res, next) => next());

// Use Scraper Routes
app.use('/api/scraper', scraperRoutes);

describe('Scraper Controller', () => {
    beforeAll(async () => {
        // Run migrations and seed the database
        await knex.migrate.rollback();
        await knex.migrate.latest();

        // Create necessary tables
        await knex.schema.createTable('users', (table) => {
            table.increments('id').primary();
            table.string('username').notNullable();
            table.string('email').notNullable().unique();
            table.string('password').notNullable();
            table.timestamps(true, true);
        });

        await knex.schema.createTable('suppliers', (table) => {
            table.increments('id').primary();
            table.string('name').notNullable();
            table.decimal('rating', 3, 2).notNullable();
            table.integer('lead_time').notNullable();
            table.decimal('return_rate', 5, 2).notNullable();
            table.timestamps(true, true);
        });

        await knex.schema.createTable('products', (table) => {
            table.increments('id').primary();
            table.string('name').notNullable();
            table.integer('search_volume').notNullable().defaultTo(0);
            table.integer('sales_rank').notNullable().defaultTo(0);
            table.integer('competitor_count').notNullable().defaultTo(0);
            table.decimal('shipping_cost', 10, 2).notNullable().defaultTo(0.00);
            table.decimal('return_rate', 5, 2).notNullable().defaultTo(0.00);
            table.decimal('seasonality_variation', 5, 2).notNullable().defaultTo(0.00);
            table.boolean('has_restrictions').notNullable().defaultTo(false);
            table.decimal('selling_price', 10, 2).notNullable().defaultTo(0.00);
            table.decimal('product_cost', 10, 2).notNullable().defaultTo(0.00);
            table.decimal('fees', 10, 2).notNullable().defaultTo(0.00);
            table.integer('supplier_id').unsigned().references('id').inTable('suppliers').onDelete('CASCADE');
            table.timestamps(true, true);
        });

        await knex.schema.createTable('alerts', (table) => {
            table.increments('id').primary();
            table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE').notNullable();
            table.integer('product_id').unsigned().references('id').inTable('products').onDelete('CASCADE').notNullable();
            table.string('condition_type').notNullable();
            table.decimal('threshold', 10, 2).notNullable();
            table.string('notification_method').notNullable();
            table.boolean('active').notNullable().defaultTo(true);
            table.timestamps(true, true);
        });

        // Seed the users table
        await knex('users').insert({
            id: 1,
            username: 'testuser',
            email: 'testuser@example.com',
            password: 'hashedpassword',
            created_at: new Date(),
            updated_at: new Date(),
        });

        // Seed the suppliers table
        await knex('suppliers').insert({
            id: 1,
            name: 'Test Supplier',
            rating: 4.5,
            lead_time: 7,
            return_rate: 0.02,
            created_at: new Date(),
            updated_at: new Date(),
        });

        // Seed the products table
        await knex('products').insert({
            id: 1,
            name: 'Test Product',
            search_volume: 1000,
            sales_rank: 50,
            competitor_count: 10,
            shipping_cost: 5.00,
            return_rate: 0.02,
            seasonality_variation: 0.1,
            has_restrictions: false,
            selling_price: 20.00,
            product_cost: 8.00,
            fees: 2.00,
            supplier_id: 1,
            created_at: new Date(),
            updated_at: new Date(),
        });
    });

    afterAll(async () => {
        await knex.migrate.rollback();
        await knex.destroy();
    });

    describe('POST /api/scraper/trigger', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        test('Should trigger scraping with valid search parameters', async () => {
            // Mock the searchProducts response
            axios.get.mockResolvedValueOnce({
                data: `
          <div class="product-item">
            <a class="product-link" href="/product/1">Product 1</a>
          </div>
          <div class="product-item">
            <a class="product-link" href="/product/2">Product 2</a>
          </div>
        `,
            });

            // Mock the scrapeProductDetails response
            axios.get.mockResolvedValue({
                data: `
          <h1 class="product-title">Scraped Product</h1>
          <div id="searchVolume">500</div>
          <div id="salesRank">30</div>
          <div id="competitorCount">5</div>
          <div id="shippingCost">$4.99</div>
          <div id="returnRate">0.01</div>
          <div id="seasonalityVariation">0.05</div>
          <div id="restrictions">none</div>
          <div id="sellingPrice">$19.99</div>
          <div id="productCost">$7.00</div>
          <div id="fees">$1.50</div>
        `,
            });

            const res = await request(app)
                .post('/api/scraper/trigger')
                .send({
                    keywords: 'wireless earbuds',
                    category: 'electronics',
                    min_price: 10,
                    max_price: 100,
                    limit: 2,
                });

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('success', true);
            expect(res.body).toHaveProperty('products');
            expect(Array.isArray(res.body.products)).toBe(true);
            expect(res.body.products.length).toEqual(2);
            expect(res.body.products[0]).toHaveProperty('name', 'Scraped Product');
            expect(res.body.products[0]).toHaveProperty('search_volume', 500);
            // Add more assertions as needed
        });

        test('Should handle scraping with invalid search parameters', async () => {
            const res = await request(app)
                .post('/api/scraper/trigger')
                .send({
                    keywords: '', // Invalid: empty keyword
                    limit: 5,
                });

            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('success', false);
            expect(res.body).toHaveProperty('error');
        });

        test('Should handle errors during scraping', async () => {
            // Mock axios to throw an error during searchProducts
            axios.get.mockRejectedValueOnce(new Error('Network Error'));

            const res = await request(app)
                .post('/api/scraper/trigger')
                .send({
                    keywords: 'wireless earbuds',
                    category: 'electronics',
                    min_price: 10,
                    max_price: 100,
                    limit: 2,
                });

            expect(res.statusCode).toEqual(500);
            expect(res.body).toHaveProperty('success', false);
            expect(res.body).toHaveProperty('error', 'Internal Server Error.');
        });
    });
});
