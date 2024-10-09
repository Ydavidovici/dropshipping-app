exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('scoring_weights').del();

  // Inserts seed entries
  await knex('scoring_weights').insert([
    { criterion: 'demand', weight: 2 },
    { criterion: 'competition', weight: 1.5 },
    { criterion: 'profitMargin', weight: 2 },
    { criterion: 'supplierReliability', weight: 1 },
    { criterion: 'shippingHandling', weight: 1 },
    { criterion: 'returnRate', weight: 1 },
    { criterion: 'seasonality', weight: 0.5 },
    { criterion: 'productRestrictions', weight: 1 },
  ]);
};
