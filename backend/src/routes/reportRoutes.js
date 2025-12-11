const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

// TODO: Add authentication middleware
// TODO: Add authorization (Admin/Manager only)

router.get('/dashboard', reportController.getDashboard);
router.get('/daily', reportController.getDailyReport);
router.get('/weekly', reportController.getWeeklyReport);
router.get('/monthly', reportController.getMonthlyReport);
router.get('/quarterly', reportController.getQuarterlyReport);
router.get('/export', reportController.exportReport);
router.get('/chart', reportController.getChartData);
router.get('/graph', reportController.getGraphData);

module.exports = router;

