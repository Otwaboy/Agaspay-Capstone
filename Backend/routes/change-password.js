const express = require('express');
const router = express.Router();
const {
  requestPasswordChange,
  verifyAndChangePassword
} = require('../controller/change-password');
const authMiddleware = require('../middleware/authentication');

// All routes require authentication
router.post('/request', authMiddleware, requestPasswordChange);
router.post('/verify', authMiddleware, verifyAndChangePassword);

module.exports = router;
