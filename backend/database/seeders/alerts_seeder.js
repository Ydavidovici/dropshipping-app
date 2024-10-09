// backend/database/seeders/alerts_seeder.js

exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('alerts').del()
      .then(function () {
        // Inserts seed entries
        return knex('alerts').insert([
          {
            id: 1,
            alert_type: 'Low Demand',
            message: 'The product "Wireless Mouse" has low demand.',
            product_id: 1,
            is_active: true,
            created_at: '2024-10-09 19:00:06.254',
            updated_at: '2024-10-09 19:00:06.254'
          },
          {
            id: 2,
            alert_type: 'High Competition',
            message: 'The product "Bluetooth Headphones" is facing high competition.',
            product_id: 2,
            is_active: true,
            created_at: '2024-10-09 19:00:06.254',
            updated_at: '2024-10-09 19:00:06.254'
          },
        ]);
      });
};
