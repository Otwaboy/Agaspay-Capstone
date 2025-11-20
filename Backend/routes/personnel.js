const express = require('express');
const router = express.Router();
const {
  getAllPersonnel,
  getPersonnel,
  createPersonnel,
  updatePersonnel,
  deletePersonnel,
  getMyProfile,
  updatePersonnelContact,
  requestPersonnelArchive,
  getPersonnelArchiveStatus,
  cancelPersonnelArchiveRequest,
  approvePersonnelArchive,
  rejectPersonnelArchive,
  unarchivePersonnel
} = require('../controller/personnel');
const authMiddleware = require('../middleware/authentication');
const roleMiddleware = require('../middleware/roleMiddleware');

// Get current logged-in personnel profile (any authenticated personnel)
router.get('/me', authMiddleware, getMyProfile);

// Update personnel contact information (any authenticated personnel)
router.patch('/contacts-update', authMiddleware, updatePersonnelContact);

// Personnel archive routes (authenticated personnel)
router.post('/archive-request', authMiddleware, requestPersonnelArchive);
router.get('/archive-status', authMiddleware, getPersonnelArchiveStatus);
router.delete('/archive-request', authMiddleware, cancelPersonnelArchiveRequest);

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

// Admin routes for personnel archive management
router.patch('/:id/approve-archive', authMiddleware, roleMiddleware('admin'), approvePersonnelArchive);
router.patch('/:id/reject-archive', authMiddleware, roleMiddleware('admin'), rejectPersonnelArchive);
router.patch('/:id/unarchive', authMiddleware, roleMiddleware('admin'), unarchivePersonnel);

module.exports = router;
