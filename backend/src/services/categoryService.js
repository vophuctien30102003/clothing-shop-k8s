const { Category, Product } = require('../models');
const { Op } = require('sequelize');

const CategoryService = {
    async create(data) {
        if (!data.name) {
            throw { status: 400, message: 'Tên danh mục là bắt buộc' };
        }

        const existing = await Category.findOne({
            where: { name: data.name },
        });

        if (existing) {
            throw { status: 400, message: 'Tên danh mục đã tồn tại' };
        }

        const category = await Category.create({
            name: data.name,
            status: data.status || 'active',
        });

        return category.get({ plain: true });
    },

    async getById(id) {
        const category = await Category.findByPk(id, {
            include: [
                {
                    model: Product,
                    as: 'products',
                    attributes: ['id', 'name', 'price', 'stock', 'status'],
                },
            ],
        });

        if (!category) {
            throw { status: 404, message: 'Danh mục không tồn tại' };
        }

        return category.get({ plain: true });
    },

    async list(filters = {}) {
        const {
            page = 1,
            limit = 100,
            status,
            search,
        } = filters;

        const offset = (page - 1) * limit;
        const where = {};

        if (status) {
            where.status = status;
        }

        if (search) {
            where.name = { [Op.like]: `%${search}%` };
        }

        const { count, rows } = await Category.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['name', 'ASC']],
        });

        return {
            categories: rows.map((category) => category.get({ plain: true })),
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(count / limit),
            },
        };
    },

    async update(id, data) {
        const category = await Category.findByPk(id);
        if (!category) {
            throw { status: 404, message: 'Danh mục không tồn tại' };
        }

        if (data.name && data.name !== category.name) {
            const existing = await Category.findOne({
                where: { name: data.name },
            });

            if (existing) {
                throw { status: 400, message: 'Tên danh mục đã tồn tại' };
            }
        }

        const allowedFields = ['name', 'status'];
        const updateData = {};

        for (const field of allowedFields) {
            if (data[field] !== undefined) {
                updateData[field] = data[field];
            }
        }

        if (Object.keys(updateData).length === 0) {
            throw { status: 400, message: 'Không có dữ liệu để cập nhật' };
        }

        await Category.update(updateData, { where: { id } });

        return await this.getById(id);
    },

    async delete(id) {
        const category = await Category.findByPk(id);
        if (!category) {
            throw { status: 404, message: 'Danh mục không tồn tại' };
        }

        const productCount = await Product.count({
            where: { category_id: id },
        });

        if (productCount > 0) {
            throw {
                status: 400,
                message: `Không thể xóa danh mục. Có ${productCount} sản phẩm đang sử dụng danh mục này.`,
            };
        }

        await Category.destroy({ where: { id } });

        return { message: 'Xóa danh mục thành công' };
    },
};

module.exports = { CategoryService };

