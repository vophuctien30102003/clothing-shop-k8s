const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// TODO: Add authentication middleware
// TODO: Add authorization (users can only see their own orders, Admin/Manager can see all)

router.post('/', orderController.createOrder);
router.get('/', orderController.listOrders);
router.get('/:id', orderController.getOrder);
router.put('/:id/status', orderController.updateOrderStatus);
router.delete('/:id', orderController.cancelOrder);

module.exports = router;

