const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { optionalAuth, authenticateLogin, authorize } = require('../middleware/auth');

router.get('/', optionalAuth, categoryController.listCategories);
router.get('/:id', optionalAuth, categoryController.getCategory);

router.post('/', authenticateLogin, authorize('manager', 'admin'), categoryController.createCategory);
router.put('/:id', authenticateLogin, authorize('manager', 'admin'), categoryController.updateCategory);
router.delete('/:id', authenticateLogin, authorize('manager', 'admin'), categoryController.deleteCategory);

module.exports = router;

