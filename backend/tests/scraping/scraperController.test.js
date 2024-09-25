// tests/scraping/scraperController.test.js

const request = require('supertest');
const express = require('express');
const knex = require('../../../database/knex'); // Adjust the path as needed
const scraperRoutes = require('../../../modules/scraper/routes/scraper');
const authenticate = require('../../../middleware/authenticate');
const authorize = require('../../../middleware/authorize');

// Mock middlewares if necessary
jest.mock('../../../middleware/authenticate');
jest.mock('../../../middleware/authorize');

const app = express();
app.use(express.json());

// Mock Authentication Middleware to always pass and set req.user
authenticate.mockImplementation((req, res, next) => {
  req.user = { id: 1 }; // Mocked authenticated user
  next();
});

// Mock Authorization Middleware to always pass
authorize.mockImplementation(() => (req, res, next) => next());

// Use Scraper Routes
app.use('/api/scraper', scraperRoutes);

describe('Scraper Controller', () => {
  beforeAll(async () => {
    // Run migrations and seed the database if necessary
    await knex.migrate.rollback();
    await knex.migrate.latest();
    // Seed data here
  });

  afterAll(async () => {
    await knex.migrate.rollback();
    await knex.destroy();
  });

  test('Should trigger scraping with valid search parameters', async () => {
    const res = await request(app)
      .post('/api/scraper/trigger')
      .send({
        keywords: 'wireless earbuds',
        category: 'electronics',
        min_price: 10,
        max_price: 100,
        limit: 5,
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('products');
    expect(Array.isArray(res.body.products)).toBe(true);
  });

  // Add more test cases as needed
});
