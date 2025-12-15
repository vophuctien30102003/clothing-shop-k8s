const { ReportModel } = require('../models/reportModel');

const ensureDate = (value, label, boundary) => {
    if (!value) {
        return null;
    }

    const parsed = value instanceof Date ? new Date(value.getTime()) : new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        throw { status: 400, message: `${label} không hợp lệ` };
    }

    if (boundary === 'start') {
        parsed.setHours(0, 0, 0, 0);
    } else if (boundary === 'end') {
        parsed.setHours(23, 59, 59, 999);
    }

    return parsed;
};

const normalizeDateRange = (startDate, endDate) => {
    const start = ensureDate(startDate, 'start_date', 'start');
    const end = ensureDate(endDate, 'end_date', 'end');

    if (start && end && start > end) {
        throw { status: 400, message: 'start_date không được lớn hơn end_date' };
    }

    return { start, end };
};

const getWeekRange = (year, week) => {
    if (!Number.isInteger(year) || !Number.isInteger(week) || week < 1 || week > 53) {
        throw { status: 400, message: 'Tuần hoặc năm không hợp lệ' };
    }

    const simple = new Date(year, 0, 1 + (week - 1) * 7);
    simple.setHours(0, 0, 0, 0);

    const dayOfWeek = simple.getDay();
    const start = new Date(simple);
    const dayAdjustment = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    start.setDate(simple.getDate() + dayAdjustment);

    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    return { start, end };
};

const getMonthRange = (year, month) => {
    if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
        throw { status: 400, message: 'Tháng hoặc năm không hợp lệ' };
    }

    const start = new Date(year, month - 1, 1);
    start.setHours(0, 0, 0, 0);
    const end = new Date(year, month, 0);
    end.setHours(23, 59, 59, 999);
    return { start, end };
};

const getQuarterRange = (year, quarter) => {
    if (!Number.isInteger(year) || !Number.isInteger(quarter) || quarter < 1 || quarter > 4) {
        throw { status: 400, message: 'Quý hoặc năm không hợp lệ' };
    }

    const monthStart = (quarter - 1) * 3;
    const start = new Date(year, monthStart, 1);
    start.setHours(0, 0, 0, 0);
    const end = new Date(year, monthStart + 3, 0);
    end.setHours(23, 59, 59, 999);
    return { start, end };
};

const ReportService = {
    async getDashboard(startDate, endDate) {
        const { start, end } = normalizeDateRange(startDate, endDate);

        const [
            totalRevenue,
            orderCounts,
            inventory,
            totalCustomers,
            topProducts,
            revenueTrend,
        ] = await Promise.all([
            ReportModel.getRevenueSummary({ startDate: start, endDate: end }),
            ReportModel.getOrderCounts({ startDate: start, endDate: end }),
            ReportModel.getInventorySnapshot(),
            ReportModel.getCustomerCount(),
            ReportModel.getTopProducts({ startDate: start, endDate: end }),
            ReportModel.getRevenueTrend({
                startDate: start,
                endDate: end,
                limit: start || end ? undefined : 30,
            }),
        ]);

        const completionRate = orderCounts.totalOrders > 0
            ? Number(((orderCounts.completedOrders / orderCounts.totalOrders) * 100).toFixed(2))
            : 0;

        return {
            kpi: {
                totalRevenue,
                totalOrders: orderCounts.totalOrders,
                completedOrders: orderCounts.completedOrders,
                pendingOrders: orderCounts.pendingOrders,
                totalProducts: inventory.totalProducts,
                outOfStockProducts: inventory.outOfStockProducts,
                totalCustomers,
                completionRate,
            },
            topProducts,
            revenueByDay: revenueTrend,
        };
    },

    async getDailyReport(date) {
        if (!date) {
            throw { status: 400, message: 'Tham số date là bắt buộc' };
        }

        const start = ensureDate(date, 'date', 'start');
        const end = ensureDate(date, 'date', 'end');
        return this.getDashboard(start, end);
    },

    async getWeeklyReport(year, week) {
        const { start, end } = getWeekRange(year, week);
        return this.getDashboard(start, end);
    },

    async getMonthlyReport(year, month) {
        const { start, end } = getMonthRange(year, month);
        return this.getDashboard(start, end);
    },

    async getQuarterlyReport(year, quarter) {
        const { start, end } = getQuarterRange(year, quarter);
        return this.getDashboard(start, end);
    },

    async getRevenueChartData(period = '7d') {
        const now = new Date();
        now.setHours(23, 59, 59, 999);

        let start;
        let groupBy = 'day';

        switch (period) {
            case '7d':
                start = new Date(now);
                start.setDate(now.getDate() - 6);
                start.setHours(0, 0, 0, 0);
                break;
            case '30d':
                start = new Date(now);
                start.setDate(now.getDate() - 29);
                start.setHours(0, 0, 0, 0);
                break;
            case '12m':
                start = new Date(now);
                start.setMonth(now.getMonth() - 11, 1);
                start.setHours(0, 0, 0, 0);
                groupBy = 'month';
                break;
            default:
                throw { status: 400, message: 'Tham số period không hợp lệ (7d, 30d, 12m)' };
        }

        return ReportModel.getRevenueByPeriod({ startDate: start, endDate: now, groupBy });
    },

    async getProductChartData() {
        return ReportModel.getProductsByCategory();
    },
};

module.exports = { ReportService };

