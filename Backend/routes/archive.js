const express = require('express');
const router = express.Router();
const {
  requestArchive,
  getArchiveRequests,
  approveArchiveRequest,
  requestVoluntaryDisconnection
} = require('../controller/archive');
const authMiddleware = require('../middleware/authentication');
const rolemiddleware = require('../middleware/roleMiddleware');

// Request archive (Resident only)
router.post('/request', authMiddleware, rolemiddleware('resident'), requestArchive);

// Get archive requests (Admin only)
router.get('/requests', authMiddleware, rolemiddleware('admin'), getArchiveRequests);

// Approve archive request (Admin only)
router.patch('/approve/:resident_id', authMiddleware, rolemiddleware('admin'), approveArchiveRequest);

// Voluntary disconnection (Resident only)
router.post('/voluntary-disconnection', authMiddleware, rolemiddleware('resident'), requestVoluntaryDisconnection);

module.exports = router;
