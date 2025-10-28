const express = require('express');
const router = express.Router();
const {
  generateRevenueReport,
  generateConsumptionReport,
  generateBillingReport,
  generateUserAnalyticsReport,
  generateIncidentReport
} = require('../controller/reports');
const authMiddleware = require('../middleware/authentication');
const roleMiddleware = require('../middleware/roleMiddleware');

// Generate revenue report (Admin, Treasurer)
router.get('/revenue', authMiddleware, roleMiddleware('admin', 'treasurer'), generateRevenueReport);

// Generate consumption report (Admin, Secretary)
router.get('/consumption', authMiddleware, roleMiddleware('admin', 'secretary'), generateConsumptionReport);

// Generate billing report (Admin, Treasurer)
router.get('/billing', authMiddleware, roleMiddleware('admin', 'treasurer'), generateBillingReport);

// Generate user analytics report (Admin, Secretary)
router.get('/users', authMiddleware, roleMiddleware('admin', 'secretary'), generateUserAnalyticsReport);

// Generate incidents report (Admin, Secretary)
router.get('/incidents', authMiddleware, roleMiddleware('admin', 'secretary'), generateIncidentReport);

module.exports = router;
