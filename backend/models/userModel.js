// models/userModel.js

const knex = require('../database/knex');

class User {
    static async createUser(userData) {
        const [user] = await knex('users')
            .insert(userData)
            .returning(['id', 'username', 'email', 'role']);
        return user;
    }

    static async findUserByEmail(email) {
        return await knex('users').where({ email }).first();
    }

    static async findUserById(id) {
        return await knex('users').where({ id }).first();
    }

    static async updateUser(id, userData) {
        return await knex('users').where({ id }).update(userData).returning('*');
    }

    static async deleteUser(id) {
        return await knex('users').where({ id }).del();
    }
}

module.exports = User;
