const { Order, OrderItem, Product, User } = require('../models');
const { Op } = require('sequelize');

const OrderService = {
    async create(data, userId) {
        if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
            throw { status: 400, message: 'Danh sách sản phẩm là bắt buộc' };
        }

        let totalAmount = 0;
        const orderItems = [];

        for (const item of data.items) {
            if (!item.product_id || !item.quantity || item.quantity <= 0) {
                throw { status: 400, message: 'Thông tin sản phẩm không hợp lệ' };
            }

            const product = await Product.findByPk(item.product_id);
            if (!product) {
                throw { status: 404, message: `Sản phẩm ID ${item.product_id} không tồn tại` };
            }

            if (product.status !== 'active') {
                throw { status: 400, message: `Sản phẩm ${product.name} không khả dụng` };
            }

            if (product.stock < item.quantity) {
                throw { status: 400, message: `Sản phẩm ${product.name} không đủ số lượng` };
            }

            const price = product.sale_price || product.price;
            const itemTotal = price * item.quantity;
            totalAmount += itemTotal;

            orderItems.push({
                product_id: item.product_id,
                quantity: item.quantity,
                price: price,
            });
        }

        const order = await Order.create({
            user_id: userId,
            total_amount: totalAmount,
            status: 'pending',
        });

        for (const item of orderItems) {
            await OrderItem.create({
                order_id: order.id,
                product_id: item.product_id,
                price: item.price,
                quantity: item.quantity,
            });

            await Product.decrement('stock', {
                by: item.quantity,
                where: { id: item.product_id },
            });
        }

        return await this.getById(order.id);
    },

    async getById(id) {
        const order = await Order.findByPk(id, {
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'email', 'name', 'phone'],
                },
                {
                    model: OrderItem,
                    as: 'orderItems',
                    include: [
                        {
                            model: Product,
                            as: 'product',
                            attributes: ['id', 'name', 'price', 'sale_price'],
                        },
                    ],
                },
            ],
        });

        if (!order) {
            throw { status: 404, message: 'Đơn hàng không tồn tại' };
        }

        return order.get({ plain: true });
    },

    async list(filters = {}) {
        const {
            page = 1,
            limit = 10,
            status,
            user_id,
            start_date,
            end_date,
            min_amount,
            max_amount,
        } = filters;

        const offset = (page - 1) * limit;
        const where = {};

        if (status) {
            where.status = status;
        }

        if (user_id) {
            where.user_id = user_id;
        }

        if (start_date || end_date) {
            where.created_at = {};
            if (start_date) {
                where.created_at[Op.gte] = new Date(start_date);
            }
            if (end_date) {
                where.created_at[Op.lte] = new Date(end_date);
            }
        }

        if (min_amount !== undefined || max_amount !== undefined) {
            where.total_amount = {};
            if (min_amount !== undefined) {
                where.total_amount[Op.gte] = min_amount;
            }
            if (max_amount !== undefined) {
                where.total_amount[Op.lte] = max_amount;
            }
        }

        const { count, rows } = await Order.findAndCountAll({
            where,
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'email', 'name'],
                },
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['created_at', 'DESC']],
        });

        return {
            orders: rows.map((order) => order.get({ plain: true })),
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(count / limit),
            },
        };
    },

    async update(id, data) {
        const order = await Order.findByPk(id);
        if (!order) {
            throw { status: 404, message: 'Đơn hàng không tồn tại' };
        }

        if (data.status) {
            const validStatuses = ['pending', 'processing', 'completed', 'cancelled'];
            if (!validStatuses.includes(data.status)) {
                throw { status: 400, message: 'Trạng thái không hợp lệ' };
            }

            if (data.status === 'cancelled' && order.status !== 'cancelled') {
                const orderItems = await OrderItem.findAll({
                    where: { order_id: id },
                });

                for (const item of orderItems) {
                    await Product.increment('stock', {
                        by: item.quantity,
                        where: { id: item.product_id },
                    });
                }
            }
        }

        const allowedFields = ['status'];
        const updateData = {};

        for (const field of allowedFields) {
            if (data[field] !== undefined) {
                updateData[field] = data[field];
            }
        }

        if (Object.keys(updateData).length === 0) {
            throw { status: 400, message: 'Không có dữ liệu để cập nhật' };
        }

        await Order.update(updateData, { where: { id } });

        return await this.getById(id);
    },

    async delete(id) {
        const order = await Order.findByPk(id);
        if (!order) {
            throw { status: 404, message: 'Đơn hàng không tồn tại' };
        }

        if (order.status !== 'cancelled') {
            const orderItems = await OrderItem.findAll({
                where: { order_id: id },
            });

            for (const item of orderItems) {
                await Product.increment('stock', {
                    by: item.quantity,
                    where: { id: item.product_id },
                });
            }
        }

        await Order.destroy({ where: { id } });

        return { message: 'Xóa đơn hàng thành công' };
    },
};

module.exports = { OrderService };

