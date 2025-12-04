const express = require('express');
const router = express.Router();
const {
  createAnnouncement,
  getAnnouncements,
  getPendingAnnouncements,
  approveAnnouncement,
  rejectAnnouncement,
  updateAnnouncement,
  archiveAnnouncement,
  incrementViews
} = require('../controller/announcement');
const authMiddleware = require('../middleware/authentication');
const rolemiddleware = require('../middleware/roleMiddleware');

// Create announcement (Secretary, Admin)
router.post('/', authMiddleware, rolemiddleware('secretary', 'admin'), createAnnouncement);

// Get all announcements (filtered by role)
router.get('/', authMiddleware, getAnnouncements);

// Get pending announcements (Admin only)
router.get('/pending', authMiddleware, rolemiddleware('admin'), getPendingAnnouncements);

// Approve announcement (Admin only)
router.patch('/:id/approve', authMiddleware, rolemiddleware('admin'), approveAnnouncement);

// Reject announcement (Admin only)
router.patch('/:id/reject', authMiddleware, rolemiddleware('admin'), rejectAnnouncement);

// Update announcement (Secretary, Admin - only if pending approval)
router.patch('/:id', authMiddleware, rolemiddleware('secretary', 'admin'), updateAnnouncement);

// Archive announcement
router.patch('/:id/archive', authMiddleware, rolemiddleware('secretary', 'admin'), archiveAnnouncement);

// Increment views
router.patch('/:id/view', authMiddleware, incrementViews);

module.exports = router;
