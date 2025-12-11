const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// TODO: Add authentication middleware
// TODO: Add role-based authorization (Admin/Manager for create/update/delete)

// Public routes
router.get('/', productController.listProducts);
router.get('/:id', productController.getProduct);

// Protected routes (Admin/Manager)
router.post('/', productController.createProduct);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);
router.post('/:id/upload-image', productController.uploadImage);
router.post('/import', productController.importProducts);
router.get('/export', productController.exportProducts);

module.exports = router;

