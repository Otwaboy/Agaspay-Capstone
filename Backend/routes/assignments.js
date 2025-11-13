const express = require('express')
const router = express.Router()

const {
  createAssignment,
  getAssignments,
  getUnassignedTasks,
  getMaintenancePersonnel,
  updateAssignment,
  deleteAssignment,
  getPersonnelAvailability,
  rescheduleAssignment,
} = require('../controller/assignment')
const authMiddleware = require('../middleware/authentication')
// ❌ DON'T import roleMiddleware - controllers handle authorization themselves

// Get all assignments & Create new assignment
router.route('/')
  .get(authMiddleware, getAssignments)     // ✅ Only authMiddleware
  .post(authMiddleware, createAssignment)   // ✅ Only authMiddleware

// Get unassigned tasks
router.route('/unassigned-tasks')
  .get(authMiddleware, getUnassignedTasks)  // ✅ Only authMiddleware

// Get maintenance personnel
router.route('/maintenance-personnel')
  .get(authMiddleware, getMaintenancePersonnel)  // ✅ Only authMiddleware

// Check personnel availability for a specific date/time
router.route('/availability/check')
  .get(authMiddleware, getPersonnelAvailability)  // ✅ Only authMiddleware

// Reschedule assignment
router.route('/reschedule')
  .put(authMiddleware, rescheduleAssignment)  // ✅ Only authMiddleware

// Update or delete assignment
router.route('/:id')
  .put(authMiddleware, updateAssignment)     // ✅ Only authMiddleware
  .delete(authMiddleware, deleteAssignment)  // ✅ Only authMiddleware

module.exports = router