const express = require('express');
const router = express.Router();
const {
  generateTemporaryReceipt,
  generateOfficialReceipt,
  getResidentReceipts,
  getReceipt
} = require('../controller/receipt');
const authMiddleware = require('../middleware/authentication');
const rolemiddleware = require('../middleware/roleMiddleware');

// Generate temporary receipt (system auto-generates after payment)
router.post('/temporary', authMiddleware, generateTemporaryReceipt);

// Generate official receipt (Treasurer only)
router.post('/official', authMiddleware, rolemiddleware('treasurer'), generateOfficialReceipt);

// Get receipts for a resident
router.get('/resident/:resident_id', authMiddleware, getResidentReceipts);

// Get specific receipt
router.get('/:id', authMiddleware, getReceipt);

module.exports = router;
