const { ProductService } = require('../services/productService');
const { ImportExportService } = require('../services/importExportService');

exports.listProducts = async (req, res) => {
    try {
        const filters = {
            ...req.query,
            public: !req.user || req.user.role === 'guest' ? true : undefined,
        };
        const result = await ProductService.list(filters);
        res.status(200).json(result);
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message || 'Lỗi khi lấy danh sách sản phẩm' });
    }
};

exports.getProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await ProductService.getById(id);

        if ((!req.user || req.user.role === 'guest') && product.status !== 'active') {
            return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
        }

        res.status(200).json({ product });
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message || 'Lỗi khi lấy thông tin sản phẩm' });
    }
};

exports.createProduct = async (req, res) => {
    try {
        const product = await ProductService.create(req.body);
        res.status(201).json({ message: 'Tạo sản phẩm thành công', product });
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message || 'Lỗi khi tạo sản phẩm' });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await ProductService.update(id, req.body);
        res.status(200).json({ message: 'Cập nhật sản phẩm thành công', product });
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message || 'Lỗi khi cập nhật sản phẩm' });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await ProductService.delete(id);
        res.status(200).json(result);
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message || 'Lỗi khi xóa sản phẩm' });
    }
};

exports.bulkDeleteProducts = async (req, res) => {
    try {
        const { ids } = req.body;
        const result = await ProductService.bulkDelete(ids);
        res.status(200).json(result);
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message || 'Lỗi khi xóa sản phẩm' });
    }
};

exports.importProducts = async (req, res) => {
    try {
        const result = await ImportExportService.importProductsFromJSON(req.body);
        res.status(200).json(result);
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message || 'Lỗi khi import sản phẩm' });
    }
};

exports.exportProducts = async (req, res) => {
    try {
        const format = req.query.format || 'json';
        const result = format === 'csv'
            ? await ImportExportService.exportProductsToCSV(req.query)
            : await ImportExportService.exportProductsToJSON(req.query);

        res.setHeader('Content-Type', result.contentType);
        res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
        res.status(200).send(result.content);
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message || 'Lỗi khi export sản phẩm' });
    }
};

exports.uploadImage = async (req, res) => {
  res.status(501).json({ message: 'Not implemented' });
};
