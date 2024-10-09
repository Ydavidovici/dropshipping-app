// backend/database/seeders/product_scores_seeder.js

exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('product_scores').del()
      .then(function () {
        // Inserts seed entries
        return knex('product_scores').insert([
          {
            id: 1,
            competition_score: 60,
            demand_score: 80,
            profit_margin_score: 70,
            shipping_handling_score: 85,
            return_rate_score: 40,
            seasonality_score: 50,
            product_restrictions_score: 100,
            final_score: 72,
            product_id: 1,
            supplier_reliability_score: 90, // Example value
            created_at: '2024-10-09 19:04:16.692',
            updated_at: '2024-10-09 19:04:16.692'
          },
          {
            id: 2,
            competition_score: 55,
            demand_score: 90,
            profit_margin_score: 65,
            shipping_handling_score: 80,
            return_rate_score: 35,
            seasonality_score: 60,
            product_restrictions_score: 100,
            final_score: 74,
            product_id: 2,
            supplier_reliability_score: 85, // Example value
            created_at: '2024-10-09 19:04:16.692',
            updated_at: '2024-10-09 19:04:16.692'
          },
        ]);
      });
};
