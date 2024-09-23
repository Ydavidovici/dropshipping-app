// models/reviewModel.js

const knex = require('../database/knex');

class Review {
    static async createReview(reviewData) {
        const [review] = await knex('reviews').insert(reviewData).returning('*');
        return review;
    }

    static async getReviewsByProductId(productId) {
        return await knex('reviews').where({ product_id: productId });
    }

    static async updateReview(id, reviewData) {
        return await knex('reviews').where({ id }).update(reviewData).returning('*');
    }

    static async deleteReview(id) {
        return await knex('reviews').where({ id }).del();
    }
}

module.exports = Review;
