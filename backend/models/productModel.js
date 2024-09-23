// models/productModel.js

const knex = require('../database/knex');

class Product {
    static async createProduct(productData) {
        const [product] = await knex('products')
            .insert(productData)
            .returning(['id', 'name', 'price']);
        return product;
    }

    static async getAllProducts() {
        return await knex('products').select('*');
    }

    static async getProductById(id) {
        return await knex('products').where({ id }).first();
    }

    static async updateProduct(id, productData) {
        return await knex('products').where({ id }).update(productData).returning('*');
    }

    static async deleteProduct(id) {
        return await knex('products').where({ id }).del();
    }
}

module.exports = Product;
