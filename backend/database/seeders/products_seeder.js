// backend/database/seeders/products_seeder.js

exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('products').del()
      .then(function () {
        // Inserts seed entries
        return knex('products').insert([
          {
            id: 1,
            category_id: 1, // Ensure this matches an existing category
            created_at: '2024-10-09 19:04:16.692',
            currency: 'USD',
            description: 'A high-precision wireless mouse with ergonomic design.',
            image_url: 'https://example.com/images/wireless-mouse.jpg',
            name: 'Wireless Mouse',
            price: 25.99,
            sales_rank: 150,
            shipping_dimensions: '4x2x1',
            shipping_weight: 0.2,
            supplier_contact_email: 'contact@techsuppliesco.com',
            supplier_contact_phone: '123-456-7890',
            supplier_name: 'Tech Supplies Co.',
            supplier_rating: 4.5,
            supplier_website: 'https://techsuppliesco.com',
            updated_at: '2024-10-09 19:04:16.692',
            url: 'https://example.com/products/wireless-mouse'
          },
          {
            id: 2,
            category_id: 1, // Ensure this matches an existing category
            created_at: '2024-10-09 19:11:04.969',
            currency: 'USD',
            description: 'Noise-cancelling over-ear Bluetooth headphones.',
            image_url: 'https://example.com/images/bluetooth-headphones.jpg',
            name: 'Bluetooth Headphones',
            price: 89.99,
            sales_rank: 80,
            shipping_dimensions: '6x4x3',
            shipping_weight: 0.5,
            supplier_contact_email: 'support@soundwaveinc.com',
            supplier_contact_phone: '987-654-3210',
            supplier_name: 'SoundWave Inc.',
            supplier_rating: 4.7,
            supplier_website: 'https://soundwaveinc.com',
            updated_at: '2024-10-09 19:11:04.969',
            url: 'https://example.com/products/bluetooth-headphones'
          },
        ]);
      });
};
