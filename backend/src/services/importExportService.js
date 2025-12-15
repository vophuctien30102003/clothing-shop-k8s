const { Product, Category, Order, OrderItem } = require('../models');
const fs = require('fs');
const path = require('path');

const ImportExportService = {
    async exportProductsToCSV(filters = {}) {
        const { products } = await require('./productService').ProductService.list({
            ...filters,
            limit: 10000,
        });

        const headers = ['ID', 'Tên', 'Mô tả', 'Giá', 'Giá khuyến mãi', 'Tồn kho', 'Trạng thái', 'Danh mục', 'Ngày tạo'];
        const rows = products.map((p) => [
            p.id,
            `"${(p.name || '').replace(/"/g, '""')}"`,
            `"${(p.description || '').replace(/"/g, '""')}"`,
            p.price,
            p.sale_price || '',
            p.stock,
            p.status,
            p.category?.name || '',
            p.created_at,
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map((row) => row.join(',')),
        ].join('\n');

        return {
            content: csvContent,
            filename: `products_${new Date().toISOString().split('T')[0]}.csv`,
            contentType: 'text/csv',
        };
    },

    async exportProductsToJSON(filters = {}) {
        const { products } = await require('./productService').ProductService.list({
            ...filters,
            limit: 10000,
        });

        return {
            content: JSON.stringify(products, null, 2),
            filename: `products_${new Date().toISOString().split('T')[0]}.json`,
            contentType: 'application/json',
        };
    },

    async importProductsFromJSON(data) {
        if (!Array.isArray(data)) {
            throw { status: 400, message: 'Dữ liệu phải là mảng' };
        }

        const results = {
            success: 0,
            failed: 0,
            errors: [],
        };

        for (let i = 0; i < data.length; i++) {
            try {
                const item = data[i];
                if (!item.name || !item.price) {
                    results.failed++;
                    results.errors.push(`Dòng ${i + 1}: Thiếu tên hoặc giá`);
                    continue;
                }

                await Product.create({
                    name: item.name,
                    description: item.description || null,
                    price: parseFloat(item.price),
                    sale_price: item.sale_price ? parseFloat(item.sale_price) : null,
                    stock: item.stock ? parseInt(item.stock) : 0,
                    status: item.status || 'active',
                    category_id: item.category_id || null,
                });

                results.success++;
            } catch (error) {
                results.failed++;
                results.errors.push(`Dòng ${i + 1}: ${error.message || 'Lỗi không xác định'}`);
            }
        }

        return results;
    },

    async exportOrdersToCSV(filters = {}) {
        const { orders } = await require('./orderService').OrderService.list({
            ...filters,
            limit: 10000,
        });

        const headers = ['ID', 'User ID', 'Email', 'Tổng tiền', 'Trạng thái', 'Ngày tạo'];
        const rows = orders.map((o) => [
            o.id,
            o.user_id,
            o.user?.email || '',
            o.total_amount,
            o.status,
            o.created_at,
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map((row) => row.join(',')),
        ].join('\n');

        return {
            content: csvContent,
            filename: `orders_${new Date().toISOString().split('T')[0]}.csv`,
            contentType: 'text/csv',
        };
    },

    async exportOrdersToJSON(filters = {}) {
        const { orders } = await require('./orderService').OrderService.list({
            ...filters,
            limit: 10000,
        });

        return {
            content: JSON.stringify(orders, null, 2),
            filename: `orders_${new Date().toISOString().split('T')[0]}.json`,
            contentType: 'application/json',
        };
    },

    async exportCategoriesToCSV(filters = {}) {
        const { categories } = await require('./categoryService').CategoryService.list({
            ...filters,
            limit: 10000,
        });

        const headers = ['ID', 'Tên', 'Trạng thái'];
        const rows = categories.map((c) => [c.id, `"${c.name}"`, c.status]);

        const csvContent = [
            headers.join(','),
            ...rows.map((row) => row.join(',')),
        ].join('\n');

        return {
            content: csvContent,
            filename: `categories_${new Date().toISOString().split('T')[0]}.csv`,
            contentType: 'text/csv',
        };
    },
};

module.exports = { ImportExportService };

