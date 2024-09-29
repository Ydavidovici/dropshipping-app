// backend/tests/scoring/scoringController.test.js

const request = require('supertest');
const express = require('express');
const knex = require('../../../database/knex'); // Adjust the path as needed
const scoreRoutes = require('../../../modules/scoring/routes/score');
const authenticate = require('../../../middleware/authenticate');
const authorize = require('../../../middleware/authorize');

// Mock middlewares
jest.mock('../../../middleware/authenticate');
jest.mock('../../../middleware/authorize');

const app = express();
app.use(express.json());

// Mock Authentication Middleware to always pass and set req.user
authenticate.mockImplementation((req, res, next) => {
  req.user = { id: 1 }; // Mocked authenticated user with id=1
  next();
});

// Mock Authorization Middleware to always pass
authorize.mockImplementation(() => (req, res, next) => next());

// Use Scoring Routes
app.use('/api/scoring', scoreRoutes);

describe('Scoring Controller', () => {
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

    await knex.schema.createTable('product_scores', (table) => {
      table.increments('id').primary();
      table.integer('product_id').unsigned().references('id').inTable('products').onDelete('CASCADE').notNullable();
      table.decimal('demand_score', 5, 2).notNullable();
      table.decimal('competition_score', 5, 2).notNullable();
      table.decimal('profit_margin_score', 5, 2).notNullable();
      table.decimal('supplier_reliability_score', 5, 2).notNullable();
      table.decimal('shipping_handling_score', 5, 2).notNullable();
      table.decimal('return_rate_score', 5, 2).notNullable();
      table.decimal('seasonality_score', 5, 2).notNullable();
      table.decimal('product_restrictions_score', 5, 2).notNullable();
      table.decimal('final_score', 5, 2).notNullable();
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

    // Optionally, seed product_scores if needed
  });

  afterAll(async () => {
    await knex.migrate.rollback();
    await knex.destroy();
  });

  describe('POST /api/scoring/calculate', () => {
    test('Should calculate and store product score', async () => {
      const res = await request(app)
          .post('/api/scoring/calculate')
          .send({ product_id: 1 });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('score');
      expect(res.body.score).toHaveProperty('demand_score');
      expect(res.body.score).toHaveProperty('competition_score');
      expect(res.body.score).toHaveProperty('profit_margin_score');
      expect(res.body.score).toHaveProperty('supplier_reliability_score');
      expect(res.body.score).toHaveProperty('shipping_handling_score');
      expect(res.body.score).toHaveProperty('return_rate_score');
      expect(res.body.score).toHaveProperty('seasonality_score');
      expect(res.body.score).toHaveProperty('product_restrictions_score');
      expect(res.body.score).toHaveProperty('final_score');
      expect(res.body.score.product_id).toEqual(1);
    });

    test('Should return 404 for non-existent product', async () => {
      const res = await request(app)
          .post('/api/scoring/calculate')
          .send({ product_id: 999 }); // Assuming 999 does not exist

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('error', 'Product not found.');
    });

    test('Should handle internal server errors gracefully', async () => {
      // Mock ScoringService to throw an error
      const ScoringService = require('../../../modules/scoring/services/scoringAlgorithm');
      jest.spyOn(ScoringService, 'scoreProduct').mockImplementation(() => {
        throw new Error('Scoring Error');
      });

      const res = await request(app)
          .post('/api/scoring/calculate')
          .send({ product_id: 1 });

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('error', 'Internal Server Error.');

      // Restore the original implementation
      ScoringService.scoreProduct.mockRestore();
    });
  });

  describe('GET /api/scoring/get', () => {
    test('Should retrieve the score for a specific product', async () => {
      // First, calculate the score
      await request(app)
          .post('/api/scoring/calculate')
          .send({ product_id: 1 });

      const res = await request(app)
          .get('/api/scoring/get')
          .query({ product_id: 1 });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('score');
      expect(res.body.score).toHaveProperty('final_score');
      expect(res.body.score.product_id).toEqual(1);
    });

    test('Should return 404 if score not found for the product', async () => {
      const res = await request(app)
          .get('/api/scoring/get')
          .query({ product_id: 999 }); // Assuming 999 does not have a score

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('error', 'Score not found for the specified product.');
    });
  });
});
