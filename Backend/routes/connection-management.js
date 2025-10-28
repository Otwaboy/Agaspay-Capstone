const express = require('express');
const router = express.Router();
const {
  updateConnectionStatus,
  scheduleConnectionTask,
  getDelinquentAccounts,
  markForDisconnection
} = require('../controller/connection-management');
const authMiddleware = require('../middleware/authentication');
const rolemiddleware = require('../middleware/roleMiddleware');

// Update connection status
router.patch('/:connection_id/status', authMiddleware, rolemiddleware('secretary', 'admin', 'treasurer'), updateConnectionStatus);

// One-click schedule task
router.post('/schedule-task', authMiddleware, rolemiddleware('secretary', 'admin'), scheduleConnectionTask);

// Get delinquent accounts
router.get('/delinquent', authMiddleware, rolemiddleware('treasurer', 'admin'), getDelinquentAccounts);

// Mark for disconnection
router.patch('/:connection_id/mark-disconnection', authMiddleware, rolemiddleware('treasurer'), markForDisconnection);

module.exports = router;
