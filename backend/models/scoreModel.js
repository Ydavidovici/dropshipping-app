// models/scoreModel.js

const knex = require('../database/knex');

class Score {
    static async createProductScore(scoreData) {
        const [score] = await knex('product_scores').insert(scoreData).returning('*');
        return score;
    }

    static async getScoresByProductId(productId) {
        return await knex('product_scores').where({ product_id: productId });
    }
}

module.exports = Score;
