const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticateLogin, authorize } = require('../middleware/auth');

router.post('/', authenticateLogin, orderController.createOrder);
router.get('/', authenticateLogin, orderController.listOrders);
router.get('/:id', authenticateLogin, orderController.getOrder);

router.put('/:id', authenticateLogin, authorize('manager', 'admin'), orderController.updateOrder);
router.delete('/:id', authenticateLogin, authorize('manager', 'admin'), orderController.deleteOrder);

module.exports = router;

