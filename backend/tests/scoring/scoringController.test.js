// tests/scoring/scoringController.test.js

const request = require('supertest');
const express = require('express');
const knex = require('../../../database/knex'); // Adjust the path as needed
const scoreRoutes = require('../../../modules/scoring/routes/score');
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

// Use Scoring Routes
app.use('/api/scoring', scoreRoutes);

describe('Scoring Controller', () => {
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

  test('Should calculate and store product score', async () => {
    const res = await request(app)
      .post('/api/scoring/calculate')
      .send({ product_id: 1 });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('score');
    expect(res.body.score).toHaveProperty('final_score');
    expect(res.body.score.product_id).toEqual(1);
  });

  // Add more test cases as needed
});
