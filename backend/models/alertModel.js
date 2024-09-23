// models/alertModel.js

const knex = require('../database/knex');

class Alert {
    static async createAlert(alertData) {
        const [alert] = await knex('alerts').insert(alertData).returning('*');
        return alert;
    }

    static async getAlerts() {
        return await knex('alerts').select('*');
    }

    static async deleteAlert(id) {
        return await knex('alerts').where({ id }).del();
    }
}

module.exports = Alert;
