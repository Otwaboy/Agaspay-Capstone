const express = require('express');
const router = express.Router();
const { getDashboardStats, getSecretaryFinancialStats } = require('../controller/dashboard');
const authMiddleware = require('../middleware/authentication');
const roleMiddleware = require('../middleware/roleMiddleware');

// Get dashboard statistics (Admin, Secretary, Treasurer)
router.get('/stats', authMiddleware, roleMiddleware('admin', 'secretary', 'treasurer'), getDashboardStats);

// Get secretary financial statistics (Admin, Secretary, Treasurer)
router.get('/financial-stats', authMiddleware, roleMiddleware('admin', 'secretary', 'treasurer'), getSecretaryFinancialStats);

module.exports = router;
