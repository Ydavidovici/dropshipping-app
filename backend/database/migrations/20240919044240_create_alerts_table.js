// 20240919044240_create_alerts_table.js

exports.up = function(knex) {
    return knex.schema.createTable('alerts', table => {
        table.increments('id').primary();
        table.string('alert_type').notNullable(); // Ensure this line exists
        table.string('message').notNullable();
        table.integer('product_id').unsigned().references('id').inTable('products').onDelete('CASCADE');
        table.boolean('is_active').notNullable().defaultTo(true);
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());
    });
};

exports.down = function(knex) {
    return knex.schema.dropTableIfExists('alerts');
};
