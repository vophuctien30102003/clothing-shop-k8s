const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { optionalAuth, authenticateLogin, authorize } = require('../middleware/auth');

router.get('/', optionalAuth, productController.listProducts);
router.get('/:id', optionalAuth, productController.getProduct);

router.post('/', authenticateLogin, authorize('manager', 'admin'), productController.createProduct);
router.put('/:id', authenticateLogin, authorize('manager', 'admin'), productController.updateProduct);
router.delete('/:id', authenticateLogin, authorize('manager', 'admin'), productController.deleteProduct);
router.post('/bulk-delete', authenticateLogin, authorize('manager', 'admin'), productController.bulkDeleteProducts);

router.post('/import', authenticateLogin, authorize('manager', 'admin'), productController.importProducts);
router.get('/export', authenticateLogin, authorize('manager', 'admin'), productController.exportProducts);

router.post('/:id/upload-image', authenticateLogin, authorize('manager', 'admin'), productController.uploadImage);

module.exports = router;
