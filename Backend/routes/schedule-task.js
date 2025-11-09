const express = require('express')
const router = express.Router()

const {getTasks, createTask, updateTaskStatus, deleteTask} = require('../controller/schedule-task')

const rolemiddleware = require('../middleware/roleMiddleware')
const authMiddleware = require('../middleware/authentication')

// Get all schedule tasks (admin, secretary, meter_reader, maintenance)
router.route('/')
  .get(authMiddleware, rolemiddleware('admin', 'secretary', 'meter_reader', 'maintenance'), getTasks)
  .post(authMiddleware, rolemiddleware('admin', 'secretary', 'meter_reader', 'maintenance'), createTask)

// Update task status (admin, secretary, meter_reader, maintenance)
router.route('/:taskId/status')
  .patch(authMiddleware, rolemiddleware('admin', 'secretary', 'meter_reader', 'maintenance'), updateTaskStatus)

// Delete task (admin, secretary only)
router.route('/:taskId')
  .delete(authMiddleware, rolemiddleware('admin', 'secretary'), deleteTask)

module.exports = router  