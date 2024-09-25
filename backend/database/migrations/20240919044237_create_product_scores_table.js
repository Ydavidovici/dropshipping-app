// backend/database/migrations/20240925_create_product_scores_table.js

exports.up = function(knex) {
    return knex.schema.createTable('product_scores', (table) => {
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
};

exports.down = function(knex) {
    return knex.schema.dropTableIfExists('product_scores');
};
