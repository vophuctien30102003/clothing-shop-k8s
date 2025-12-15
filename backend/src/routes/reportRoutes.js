const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticateLogin, authorize } = require('../middleware/auth');

router.get('/dashboard', authenticateLogin, authorize('manager', 'admin'), reportController.getDashboard);
router.get('/daily', authenticateLogin, authorize('manager', 'admin'), reportController.getDailyReport);
router.get('/weekly', authenticateLogin, authorize('manager', 'admin'), reportController.getWeeklyReport);
router.get('/monthly', authenticateLogin, authorize('manager', 'admin'), reportController.getMonthlyReport);
router.get('/quarterly', authenticateLogin, authorize('manager', 'admin'), reportController.getQuarterlyReport);
router.get('/chart', authenticateLogin, authorize('manager', 'admin'), reportController.getChartData);
router.get('/graph', authenticateLogin, authorize('manager', 'admin'), reportController.getGraphData);
router.get('/export', authenticateLogin, authorize('manager', 'admin'), reportController.exportReport);

module.exports = router;
