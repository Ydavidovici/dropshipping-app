// backend/database/seeders/categories_seeder.js

exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('categories').del()
      .then(function () {
        // Inserts seed entries
        return knex('categories').insert([
          { id: 1, name: 'Electronics', created_at: knex.fn.now(), updated_at: knex.fn.now() },
          { id: 2, name: 'Books', created_at: knex.fn.now(), updated_at: knex.fn.now() },
          // Add more categories as needed
        ]);
      });
};
