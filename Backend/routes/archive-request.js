const express = require('express');
const router = express.Router();
const {
  requestArchive,
  getArchiveStatus,
  cancelArchiveRequest,
  approveArchiveRequest,
  rejectArchiveRequest
} = require('../controller/archive-request');
const authMiddleware = require('../middleware/authentication');

// All routes require authentication
router.post('/request', authMiddleware, requestArchive);
router.get('/status', authMiddleware, getArchiveStatus);
router.post('/cancel', authMiddleware, cancelArchiveRequest);
router.patch('/approve/:connection_id', authMiddleware, approveArchiveRequest);
router.patch('/reject/:connection_id', authMiddleware, rejectArchiveRequest);

module.exports = router;
