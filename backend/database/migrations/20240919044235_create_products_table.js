// backend/database/migrations/20240925_create_products_table.js

exports.up = function(knex) {
    return knex.schema.createTable('products', (table) => {
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
};

exports.down = function(knex) {
    return knex.schema.dropTableIfExists('products');
};
