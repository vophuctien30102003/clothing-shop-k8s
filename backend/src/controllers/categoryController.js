const { CategoryService } = require('../services/categoryService');

exports.listCategories = async (req, res) => {
    try {
        const result = await CategoryService.list(req.query);
        res.status(200).json(result);
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message || 'Lỗi khi lấy danh sách danh mục' });
    }
};

exports.getCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await CategoryService.getById(id);
        res.status(200).json({ category });
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message || 'Lỗi khi lấy thông tin danh mục' });
    }
};

exports.createCategory = async (req, res) => {
    try {
        const category = await CategoryService.create(req.body);
        res.status(201).json({ message: 'Tạo danh mục thành công', category });
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message || 'Lỗi khi tạo danh mục' });
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await CategoryService.update(id, req.body);
        res.status(200).json({ message: 'Cập nhật danh mục thành công', category });
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message || 'Lỗi khi cập nhật danh mục' });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await CategoryService.delete(id);
        res.status(200).json(result);
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message || 'Lỗi khi xóa danh mục' });
    }
};
