const { Product, Category } = require('../models');
const { Op } = require('sequelize');

const ProductService = {
    async create(data, userId) {
        if (!data.name || !data.price) {
            throw { status: 400, message: 'Tên sản phẩm và giá là bắt buộc' };
        }

        if (data.price < 0) {
            throw { status: 400, message: 'Giá sản phẩm không được âm' };
        }

        if (data.sale_price !== undefined && data.sale_price !== null) {
            if (data.sale_price < 0) {
                throw { status: 400, message: 'Giá khuyến mãi không được âm' };
            }
            if (data.sale_price >= data.price) {
                throw { status: 400, message: 'Giá khuyến mãi phải nhỏ hơn giá gốc' };
            }
        }

        if (data.stock !== undefined && data.stock < 0) {
            throw { status: 400, message: 'Số lượng tồn kho không được âm' };
        }

        if (data.category_id) {
            const category = await Category.findByPk(data.category_id);
            if (!category) {
                throw { status: 404, message: 'Danh mục không tồn tại' };
            }
        }

        const product = await Product.create({
            name: data.name,
            description: data.description || null,
            price: data.price,
            sale_price: data.sale_price || null,
            stock: data.stock !== undefined ? data.stock : 0,
            status: data.status || 'active',
            category_id: data.category_id || null,
        });

        return await this.getById(product.id);
    },

    async getById(id) {
        const product = await Product.findByPk(id, {
            include: [
                {
                    model: Category,
                    as: 'category',
                    attributes: ['id', 'name'],
                },
            ],
        });

        if (!product) {
            throw { status: 404, message: 'Sản phẩm không tồn tại' };
        }

        return product.get({ plain: true });
    },

    async list(filters = {}) {
        const {
            page = 1,
            limit = 10,
            status,
            category_id,
            search,
            min_price,
            max_price,
            sort_by = 'created_at',
            sort_order = 'DESC',
        } = filters;

        const offset = (page - 1) * limit;
        const where = {};

        if (filters.public === true) {
            where.status = 'active';
        } else if (status) {
            where.status = status;
        }

        if (category_id) {
            where.category_id = category_id;
        }

        if (search) {
            where[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { description: { [Op.like]: `%${search}%` } },
            ];
        }

        if (min_price !== undefined || max_price !== undefined) {
            where.price = {};
            if (min_price !== undefined) {
                where.price[Op.gte] = min_price;
            }
            if (max_price !== undefined) {
                where.price[Op.lte] = max_price;
            }
        }

        const validSortFields = ['name', 'price', 'created_at', 'stock'];
        const sortField = validSortFields.includes(sort_by) ? sort_by : 'created_at';
        const sortDirection = sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

        const { count, rows } = await Product.findAndCountAll({
            where,
            include: [
                {
                    model: Category,
                    as: 'category',
                    attributes: ['id', 'name'],
                },
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [[sortField, sortDirection]],
        });

        return {
            products: rows.map((product) => product.get({ plain: true })),
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(count / limit),
            },
        };
    },

    async update(id, data) {
        const product = await Product.findByPk(id);
        if (!product) {
            throw { status: 404, message: 'Sản phẩm không tồn tại' };
        }

        if (data.price !== undefined && data.price < 0) {
            throw { status: 400, message: 'Giá sản phẩm không được âm' };
        }

        if (data.sale_price !== undefined && data.sale_price !== null) {
            if (data.sale_price < 0) {
                throw { status: 400, message: 'Giá khuyến mãi không được âm' };
            }
            const price = data.price !== undefined ? data.price : product.price;
            if (data.sale_price >= price) {
                throw { status: 400, message: 'Giá khuyến mãi phải nhỏ hơn giá gốc' };
            }
        }

        if (data.stock !== undefined && data.stock < 0) {
            throw { status: 400, message: 'Số lượng tồn kho không được âm' };
        }

        if (data.category_id !== undefined) {
            if (data.category_id !== null) {
                const category = await Category.findByPk(data.category_id);
                if (!category) {
                    throw { status: 404, message: 'Danh mục không tồn tại' };
                }
            }
        }

        const allowedFields = [
            'name',
            'description',
            'price',
            'sale_price',
            'stock',
            'status',
            'category_id',
        ];
        const updateData = {};

        for (const field of allowedFields) {
            if (data[field] !== undefined) {
                updateData[field] = data[field];
            }
        }

        if (Object.keys(updateData).length === 0) {
            throw { status: 400, message: 'Không có dữ liệu để cập nhật' };
        }

        await Product.update(updateData, { where: { id } });

        return await this.getById(id);
    },

    async delete(id) {
        const product = await Product.findByPk(id);
        if (!product) {
            throw { status: 404, message: 'Sản phẩm không tồn tại' };
        }

        await Product.destroy({ where: { id } });

        return { message: 'Xóa sản phẩm thành công' };
    },

    async bulkDelete(ids) {
        if (!Array.isArray(ids) || ids.length === 0) {
            throw { status: 400, message: 'Danh sách ID không hợp lệ' };
        }

        const deletedCount = await Product.destroy({
            where: {
                id: {
                    [Op.in]: ids,
                },
            },
        });

        return { message: `Đã xóa ${deletedCount} sản phẩm`, deletedCount };
    },
};

module.exports = { ProductService };
