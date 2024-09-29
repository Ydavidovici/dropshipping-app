// backend/modules/scraper/discovery/sources.js

/**
 * Define your data sources here.
 * Each source can have its own search parameters and scraper logic.
 */

const sources = [
  {
    name: 'ExampleEcommerce',
    baseUrl: 'https://www.example-ecommerce.com',
    searchPath: '/search',
    selectors: {
      productLink: '.product-item a.product-link',
      productTitle: 'h1.product-title',
      searchVolume: '#searchVolume',
      salesRank: '#salesRank',
      competitorCount: '#competitorCount',
      shippingCost: '#shippingCost',
      returnRate: '#returnRate',
      seasonalityVariation: '#seasonalityVariation',
      restrictions: '#restrictions',
      sellingPrice: '#sellingPrice',
      productCost: '#productCost',
      fees: '#fees',
    },
    // Add any other necessary configurations
  },
  // Add more sources as needed
];

module.exports = sources;
