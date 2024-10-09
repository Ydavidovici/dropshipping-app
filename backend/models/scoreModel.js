// backend/modules/scoring/models/scoringModel.js

const knex = require('../../../database/knex');

const ScoringModel = {
    /**
     * Retrieve all scoring weights.
     * @returns {Array} - List of weights.
     */
    getAllWeights: async () => {
        return knex('scoring_weights').select('*');
    },

    /**
     * Update a specific weight by criterion.
     * @param {string} criterion - The scoring criterion.
     * @param {number} weight - The new weight value.
     * @returns {Object} - Updated weight record.
     */
    updateWeight: async (criterion, weight) => {
        const [updatedWeight] = await knex('scoring_weights')
            .where({ criterion })
            .update({ weight })
            .returning('*');
        return updatedWeight;
    },

    /**
     * Retrieve all scoring weights.
     * @returns {Object} - Mapping of criteria to their weights.
     */
    getCurrentWeights: async () => {
        try {
            const weights = await knex('scoring_weights').select('criterion', 'weight');
            const weightsMap = {};
            weights.forEach(w => {
                weightsMap[w.criterion] = w.weight;
            });
            return weightsMap;
        } catch (error) {
            console.error(`Error fetching scoring weights: ${error.message}`);
            throw error;
        }
    },
};

module.exports = ScoringModel;
