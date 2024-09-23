// models/orderModel.js

const knex = require('../database/knex');

class Order {
    static async createOrder(orderData) {
        const [order] = await knex('orders').insert(orderData).returning(['id', 'status']);
        return order;
    }

    static async getOrderById(id) {
        return await knex('orders').where({ id }).first();
    }

    static async getUserOrders(userId) {
        return await knex('orders').where({ user_id: userId });
    }

    static async updateOrderStatus(id, status) {
        return await knex('orders').where({ id }).update({ status }).returning('*');
    }

    static async deleteOrder(id) {
        return await knex('orders').where({ id }).del();
    }
}

module.exports = Order;
