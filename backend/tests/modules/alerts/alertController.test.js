// backend/tests/alerts/alertController.test.js

const request = require('supertest');
const express = require('express');
const knex = require('../../../database/knex'); // Adjust the path as needed
const alertsRoutes = require('../../../modules/alerts/routes/alerts');
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

// Use Alerts Routes
app.use('/api/alerts', alertsRoutes);

describe('Alerts Controller', () => {
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

  describe('POST /api/alerts', () => {
    test('Should create a new alert', async () => {
      const res = await request(app)
          .post('/api/alerts')
          .send({
            product_id: 1,
            condition_type: 'price_drop',
            threshold: 15.00,
            notification_method: 'email',
          });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('alert');
      expect(res.body.alert).toHaveProperty('id');
      expect(res.body.alert.product_id).toEqual(1);
      expect(res.body.alert.condition_type).toEqual('price_drop');
      expect(res.body.alert.threshold).toEqual('15.00'); // decimal is returned as string
      expect(res.body.alert.notification_method).toEqual('email');
      expect(res.body.alert.active).toEqual(true);
    });

    test('Should fail to create an alert with missing fields', async () => {
      const res = await request(app)
          .post('/api/alerts')
          .send({
            product_id: 1,
            // Missing condition_type and notification_method
          });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('GET /api/alerts', () => {
    test('Should retrieve all alerts for the user', async () => {
      const res = await request(app)
          .get('/api/alerts');

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('alerts');
      expect(Array.isArray(res.body.alerts)).toBe(true);
      expect(res.body.alerts.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('GET /api/alerts/:alert_id', () => {
    test('Should retrieve a specific alert by ID', async () => {
      // First, create an alert to retrieve
      const createRes = await request(app)
          .post('/api/alerts')
          .send({
            product_id: 1,
            condition_type: 'stock_low',
            threshold: 5,
            notification_method: 'sms',
          });

      const alertId = createRes.body.alert.id;

      const res = await request(app)
          .get(`/api/alerts/${alertId}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('alert');
      expect(res.body.alert.id).toEqual(alertId);
      expect(res.body.alert.condition_type).toEqual('stock_low');
      expect(res.body.alert.threshold).toEqual('5.00');
      expect(res.body.alert.notification_method).toEqual('sms');
    });

    test('Should return 404 for non-existent alert', async () => {
      const res = await request(app)
          .get('/api/alerts/999'); // Assuming 999 does not exist

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('error', 'Alert not found.');
    });
  });

  describe('PUT /api/alerts/:alert_id', () => {
    test('Should update an existing alert', async () => {
      // First, create an alert to update
      const createRes = await request(app)
          .post('/api/alerts')
          .send({
            product_id: 1,
            condition_type: 'new_competitor',
            threshold: 1,
            notification_method: 'push',
          });

      const alertId = createRes.body.alert.id;

      const res = await request(app)
          .put(`/api/alerts/${alertId}`)
          .send({
            threshold: 0.5,
            notification_method: 'email',
          });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('alert');
      expect(res.body.alert.id).toEqual(alertId);
      expect(res.body.alert.threshold).toEqual('0.50');
      expect(res.body.alert.notification_method).toEqual('email');
    });

    test('Should return 404 when updating a non-existent alert', async () => {
      const res = await request(app)
          .put('/api/alerts/999') // Assuming 999 does not exist
          .send({
            threshold: 0.5,
          });

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('error', 'Alert not found.');
    });
  });

  describe('DELETE /api/alerts/:alert_id', () => {
    test('Should delete an existing alert', async () => {
      // First, create an alert to delete
      const createRes = await request(app)
          .post('/api/alerts')
          .send({
            product_id: 1,
            condition_type: 'stock_low',
            threshold: 3,
            notification_method: 'push',
          });

      const alertId = createRes.body.alert.id;

      const res = await request(app)
          .delete(`/api/alerts/${alertId}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('deleted', true);

      // Verify deletion
      const getRes = await request(app)
          .get(`/api/alerts/${alertId}`);

      expect(getRes.statusCode).toEqual(404);
      expect(getRes.body).toHaveProperty('success', false);
      expect(getRes.body).toHaveProperty('error', 'Alert not found.');
    });

    test('Should return 404 when deleting a non-existent alert', async () => {
      const res = await request(app)
          .delete('/api/alerts/999'); // Assuming 999 does not exist

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('error', 'Alert not found.');
    });
  });
});
