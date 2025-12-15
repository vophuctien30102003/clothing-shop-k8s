const { OrderService } = require('../services/orderService');

exports.listOrders = async (req, res) => {
    try {
        const filters = { ...req.query };
        if (req.user && req.user.role === 'user') {
            filters.user_id = req.user.id;
        }
        const result = await OrderService.list(filters);
        res.status(200).json(result);
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message || 'Lỗi khi lấy danh sách đơn hàng' });
    }
};

exports.getOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await OrderService.getById(id);

        if (req.user && req.user.role === 'user' && order.user_id !== req.user.id) {
            return res.status(403).json({ message: 'Không có quyền xem đơn hàng này' });
        }

        res.status(200).json({ order });
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message || 'Lỗi khi lấy thông tin đơn hàng' });
    }
};

exports.createOrder = async (req, res) => {
    try {
        const userId = req.user.id;
        const order = await OrderService.create(req.body, userId);
        res.status(201).json({ message: 'Tạo đơn hàng thành công', order });
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message || 'Lỗi khi tạo đơn hàng' });
    }
};

exports.updateOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await OrderService.update(id, req.body);
        res.status(200).json({ message: 'Cập nhật đơn hàng thành công', order });
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message || 'Lỗi khi cập nhật đơn hàng' });
    }
};

exports.deleteOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await OrderService.delete(id);
        res.status(200).json(result);
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message || 'Lỗi khi xóa đơn hàng' });
    }
};
