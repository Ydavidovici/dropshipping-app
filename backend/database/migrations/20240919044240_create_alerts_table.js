// backend/database/migrations/20240925_create_alerts_table.js

exports.up = function(knex) {
    return knex.schema.createTable('alerts', (table) => {
        table.increments('id').primary();
        table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE').notNullable();
        table.integer('product_id').unsigned().references('id').inTable('products').onDelete('CASCADE').notNullable();
        table.string('condition_type').notNullable(); // e.g., 'price_drop', 'stock_low', 'new_competitor'
        table.decimal('threshold', 10, 2).notNullable(); // Value that triggers the alert
        table.string('notification_method').notNullable(); // 'email', 'sms', 'push'
        table.boolean('active').notNullable().defaultTo(true);
        table.timestamps(true, true);
    });
};

exports.down = function(knex) {
    return knex.schema.dropTableIfExists('alerts');
};
