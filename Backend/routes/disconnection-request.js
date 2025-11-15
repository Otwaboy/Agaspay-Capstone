const express = require('express');
const router = express.Router();
const {
  requestDisconnection,
  getDisconnectionStatus,
  cancelDisconnectionRequest
} = require('../controller/disconnection-request');
const authMiddleware = require('../middleware/authentication');

// All routes require authentication
router.post('/request', authMiddleware, requestDisconnection);
router.get('/status', authMiddleware, getDisconnectionStatus);
router.post('/cancel', authMiddleware, cancelDisconnectionRequest);

module.exports = router;
