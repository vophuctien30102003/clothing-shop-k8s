const { Op, fn, col, literal } = require('sequelize');
const { Order, OrderItem, Product, User, Category } = require('./index');

// Define status groupings once so reporting logic stays consistent.
const COMPLETED_STATUSES = ['completed', 'done'];
const PENDING_STATUSES = ['pending', 'processing', 'shipping'];

const buildDateRangeFilter = (startDate, endDate) => {
    if (!startDate && !endDate) {
        return {};
    }

    const range = {};
    if (startDate) {
        range[Op.gte] = startDate;
    }
    if (endDate) {
        range[Op.lte] = endDate;
    }

    return { created_at: range };
};

const ReportModel = {
    async getRevenueSummary({ startDate, endDate }) {
        const where = {
            ...buildDateRangeFilter(startDate, endDate),
            status: { [Op.in]: COMPLETED_STATUSES },
        };

        const totalRevenue = (await Order.sum('total_amount', { where })) || 0;

        return parseFloat(totalRevenue);
    },

    async getOrderCounts({ startDate, endDate }) {
        const dateFilter = buildDateRangeFilter(startDate, endDate);

        const [totalOrders, completedOrders, pendingOrders] = await Promise.all([
            Order.count({ where: dateFilter }),
            Order.count({
                where: {
                    ...dateFilter,
                    status: { [Op.in]: COMPLETED_STATUSES },
                },
            }),
            Order.count({
                where: {
                    ...dateFilter,
                    status: { [Op.in]: PENDING_STATUSES },
                },
            }),
        ]);

        return {
            totalOrders,
            completedOrders,
            pendingOrders,
        };
    },

    async getInventorySnapshot() {
        const [totalProducts, outOfStockProducts] = await Promise.all([
            Product.count(),
            Product.count({ where: { stock: 0 } }),
        ]);

        return {
            totalProducts,
            outOfStockProducts,
        };
    },

    async getCustomerCount() {
        return User.count({ where: { role: 'user' } });
    },

    async getTopProducts({ startDate, endDate, limit = 5 }) {
        const items = await OrderItem.findAll({
            attributes: [
                'product_id',
                [fn('SUM', col('quantity')), 'total_sold'],
                [fn('SUM', literal('quantity * price')), 'total_revenue'],
            ],
            include: [
                {
                    model: Product,
                    as: 'product',
                    attributes: ['id', 'name', 'price'],
                },
                {
                    model: Order,
                    as: 'order',
                    attributes: [],
                    where: {
                        ...buildDateRangeFilter(startDate, endDate),
                        status: { [Op.in]: COMPLETED_STATUSES },
                    },
                },
            ],
            group: ['product_id', 'product.id'],
            order: [[literal('total_sold'), 'DESC']],
            limit,
            raw: false,
        });

        return items.map((item) => ({
            product: item.product?.get({ plain: true }) || null,
            totalSold: parseInt(item.get('total_sold') || 0, 10),
            totalRevenue: parseFloat(item.get('total_revenue') || 0),
        }));
    },

    async getRevenueTrend({ startDate, endDate, limit }) {
        const queryOptions = {
            attributes: [
                [fn('DATE', col('created_at')), 'date'],
                [fn('SUM', col('total_amount')), 'revenue'],
                [fn('COUNT', col('id')), 'orders'],
            ],
            where: {
                ...buildDateRangeFilter(startDate, endDate),
                status: { [Op.in]: COMPLETED_STATUSES },
            },
            group: [fn('DATE', col('created_at'))],
            order: [[fn('DATE', col('created_at')), 'ASC']],
        };

        if (limit && Number.isInteger(limit) && limit > 0) {
            queryOptions.limit = limit;
        }

        const rows = await Order.findAll(queryOptions);

        return rows.map((row) => ({
            date: row.get('date'),
            revenue: parseFloat(row.get('revenue') || 0),
            orders: parseInt(row.get('orders') || 0, 10),
        }));
    },

    async getRevenueByPeriod({ startDate, endDate, groupBy }) {
        const isMonthly = groupBy === 'month';
        const periodExpression = isMonthly
            ? [fn('DATE_FORMAT', col('created_at'), '%Y-%m'), 'period']
            : [fn('DATE', col('created_at')), 'period'];

        const rows = await Order.findAll({
            attributes: [
                periodExpression,
                [fn('SUM', col('total_amount')), 'revenue'],
                [fn('COUNT', col('id')), 'orders'],
            ],
            where: {
                ...buildDateRangeFilter(startDate, endDate),
                status: { [Op.in]: COMPLETED_STATUSES },
            },
            group: ['period'],
            order: [['period', 'ASC']],
        });

        return rows.map((row) => ({
            period: row.get('period'),
            revenue: parseFloat(row.get('revenue') || 0),
            orders: parseInt(row.get('orders') || 0, 10),
        }));
    },

    async getProductsByCategory() {
        const rows = await Product.findAll({
            attributes: [[fn('COUNT', col('Product.id')), 'count']],
            include: [
                {
                    model: Category,
                    as: 'category',
                    attributes: ['id', 'name'],
                },
            ],
            group: ['category.id'],
        });

        return rows.map((row) => ({
            category: row.category?.name || 'Không có danh mục',
            count: parseInt(row.get('count') || 0, 10),
        }));
    },
};

module.exports = {
    ReportModel,
    COMPLETED_STATUSES,
    PENDING_STATUSES,
};
