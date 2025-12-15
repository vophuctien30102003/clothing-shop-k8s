const { ReportService } = require('../services/reportService');
const { ImportExportService } = require('../services/importExportService');

exports.getDashboard = async (req, res) => {
    try {
        const { start_date, end_date } = req.query;
        const data = await ReportService.getDashboard(start_date, end_date);
        res.status(200).json(data);
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message || 'Lỗi khi lấy dashboard' });
    }
};

exports.getDailyReport = async (req, res) => {
    try {
        const { date } = req.query;
        if (!date) {
            return res.status(400).json({ message: 'Tham số date là bắt buộc (YYYY-MM-DD)' });
        }
        const data = await ReportService.getDailyReport(date);
        res.status(200).json(data);
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message || 'Lỗi khi lấy báo cáo ngày' });
    }
};

exports.getWeeklyReport = async (req, res) => {
    try {
        const { year, week } = req.query;
        if (!year || !week) {
            return res.status(400).json({ message: 'Tham số year và week là bắt buộc' });
        }
        const yearNum = Number.parseInt(year, 10);
        const weekNum = Number.parseInt(week, 10);
        if (Number.isNaN(yearNum) || Number.isNaN(weekNum)) {
            return res.status(400).json({ message: 'Year hoặc week không hợp lệ' });
        }

        const data = await ReportService.getWeeklyReport(yearNum, weekNum);
        res.status(200).json(data);
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message || 'Lỗi khi lấy báo cáo tuần' });
    }
};

exports.getMonthlyReport = async (req, res) => {
    try {
        const { year, month } = req.query;
        if (!year || !month) {
            return res.status(400).json({ message: 'Tham số year và month là bắt buộc' });
        }
        const yearNum = Number.parseInt(year, 10);
        const monthNum = Number.parseInt(month, 10);
        if (Number.isNaN(yearNum) || Number.isNaN(monthNum)) {
            return res.status(400).json({ message: 'Year hoặc month không hợp lệ' });
        }

        const data = await ReportService.getMonthlyReport(yearNum, monthNum);
        res.status(200).json(data);
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message || 'Lỗi khi lấy báo cáo tháng' });
    }
};

exports.getQuarterlyReport = async (req, res) => {
    try {
        const { year, quarter } = req.query;
        if (!year || !quarter) {
            return res.status(400).json({ message: 'Tham số year và quarter là bắt buộc' });
        }
        const yearNum = Number.parseInt(year, 10);
        const quarterNum = Number.parseInt(quarter, 10);
        if (Number.isNaN(yearNum) || Number.isNaN(quarterNum)) {
            return res.status(400).json({ message: 'Year hoặc quarter không hợp lệ' });
        }

        const data = await ReportService.getQuarterlyReport(yearNum, quarterNum);
        res.status(200).json(data);
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message || 'Lỗi khi lấy báo cáo quý' });
    }
};

exports.getChartData = async (req, res) => {
    try {
        const { type, period } = req.query;
        let data;

        if (type === 'revenue') {
            data = await ReportService.getRevenueChartData(period || '7d');
        } else if (type === 'product') {
            data = await ReportService.getProductChartData();
        } else {
            return res.status(400).json({ message: 'Loại biểu đồ không hợp lệ (revenue/product)' });
        }

        res.status(200).json({ data });
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message || 'Lỗi khi lấy dữ liệu biểu đồ' });
    }
};

exports.getGraphData = async (req, res) => {
    return exports.getChartData(req, res);
};

exports.exportReport = async (req, res) => {
    try {
        const { type, format, ...filters } = req.query;

        if (!type || !format) {
            return res.status(400).json({ message: 'Tham số type và format là bắt buộc' });
        }

        let result;
        if (type === 'products') {
            if (format === 'csv') {
                result = await ImportExportService.exportProductsToCSV(filters);
            } else if (format === 'json') {
                result = await ImportExportService.exportProductsToJSON(filters);
            } else {
                return res.status(400).json({ message: 'Format không hợp lệ (csv/json)' });
            }
        } else if (type === 'orders') {
            if (format === 'csv') {
                result = await ImportExportService.exportOrdersToCSV(filters);
            } else if (format === 'json') {
                result = await ImportExportService.exportOrdersToJSON(filters);
            } else {
                return res.status(400).json({ message: 'Format không hợp lệ (csv/json)' });
            }
        } else if (type === 'categories') {
            if (format === 'csv') {
                result = await ImportExportService.exportCategoriesToCSV(filters);
            } else {
                return res.status(400).json({ message: 'Format không hợp lệ (csv)' });
            }
        } else {
            return res.status(400).json({ message: 'Type không hợp lệ (products/orders/categories)' });
        }

        res.setHeader('Content-Type', result.contentType);
        res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
        res.status(200).send(result.content);
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message || 'Lỗi khi xuất báo cáo' });
    }
};
