const express = require('express');
const router = express.Router();
const {
  getAllPersonnel,
  getPersonnel,
  createPersonnel,
  updatePersonnel,
  deletePersonnel
} = require('../controller/personnel');
const authMiddleware = require('../middleware/authentication');
const roleMiddleware = require('../middleware/roleMiddleware');

// Get all personnel (Admin only)
router.get('/', authMiddleware, roleMiddleware('admin'), getAllPersonnel);

// Get single personnel (Admin only)
router.get('/:id', authMiddleware, roleMiddleware('admin'), getPersonnel);

// Create personnel (Admin only)
router.post('/', authMiddleware, createPersonnel);

// Update personnel (Admin only)
router.patch('/:id', authMiddleware, roleMiddleware('admin'), updatePersonnel);

// Delete personnel (Admin only)
router.delete('/:id', authMiddleware, roleMiddleware('admin'), deletePersonnel);

module.exports = router;
