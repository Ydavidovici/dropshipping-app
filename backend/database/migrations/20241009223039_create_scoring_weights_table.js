/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('scoring_weights', table => {
        table.increments('id').primary();
        table.string('criterion').notNullable().unique();
        table.float('weight').notNullable().defaultTo(1.0);
        table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTableIfExists('scoring_weights');
};
