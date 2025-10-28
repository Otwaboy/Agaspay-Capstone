const express = require('express')
const router = express.Router()

const {createReports, getReports, updateIncidentStatus, getAllIncidents} = require('../controller/incident-report')

const authMiddleware = require('../middleware/authentication') 
const roleMiddleware = require('../middleware/roleMiddleware')

// Create incident report
router.post('/', authMiddleware, roleMiddleware('meter_reader', 'resident', 'secretary'), createReports)

// Get reports (filtered by role)
router.get('/', authMiddleware, roleMiddleware('meter_reader', 'resident', 'secretary'), getReports)

// Get all incidents (Admin only)
router.get('/all', authMiddleware, roleMiddleware('admin', 'secretary', 'maintenance'), getAllIncidents)

// Update incident status (Admin, Secretary, Maintenance)
router.patch('/:id/status', authMiddleware, roleMiddleware('admin', 'secretary', 'maintenance'), updateIncidentStatus)

module.exports = router


