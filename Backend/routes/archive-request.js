const express = require('express');
const router = express.Router();
const {
  requestArchive,
  getArchiveStatus,
  cancelArchiveRequest
} = require('../controller/archive-request');
const authMiddleware = require('../middleware/authentication');

// All routes require authentication
router.post('/request', authMiddleware, requestArchive);
router.get('/status', authMiddleware, getArchiveStatus);
router.post('/cancel', authMiddleware, cancelArchiveRequest);

module.exports = router;
