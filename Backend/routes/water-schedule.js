const express = require('express');
const router = express.Router();
const {
  createSchedule,
  getSchedules,
  getPendingSchedules,
  approveSchedule,
  rejectSchedule,
  archiveSchedule
} = require('../controller/water-schedule');
const authMiddleware = require('../middleware/authentication');
const rolemiddleware = require('../middleware/roleMiddleware');

// Create schedule (Secretary, Admin)
router.post('/', authMiddleware, rolemiddleware('secretary', 'admin'), createSchedule);

// Get all schedules (filtered by role)
router.get('/', authMiddleware, getSchedules);

// Get pending schedules (Admin only)
router.get('/pending', authMiddleware, rolemiddleware('admin'), getPendingSchedules);

// Approve schedule (Admin only)
router.patch('/:id/approve', authMiddleware, rolemiddleware('admin'), approveSchedule);

// Reject schedule (Admin only)
router.patch('/:id/reject', authMiddleware, rolemiddleware('admin'), rejectSchedule);

// Archive schedule
router.patch('/:id/archive', authMiddleware, rolemiddleware('secretary', 'admin'), archiveSchedule);

module.exports = router;
