// 20240919044232_create_suppliers_table.js

exports.up = function(knex) {
    return knex.schema.createTable('suppliers', table => {
        table.increments('id').primary();
        table.string('name').notNullable();
        table.string('contact_email').notNullable();
        table.timestamps(true, true);
    });
};

exports.down = function(knex) {
    return knex.schema.dropTableIfExists('suppliers');
};
