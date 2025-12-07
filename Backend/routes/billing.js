const express = require('express')
const router = express.Router()
const { createBilling, getBilling, getOverdueBilling, sendReminderSMS, UpdateWaterConnectionStatus, createMeterInstallationFeeBilling} = require('../controller/billing')

const authMiddleware = require('../middleware/authentication')
const roleMiddleware = require('../middleware/roleMiddleware')

router.route('/')
.post(authMiddleware, roleMiddleware('treasurer'), createBilling)
.get(authMiddleware, roleMiddleware('resident' , 'treasurer', 'admin'), getBilling)

router.route('/meter-installation-fee')
.post(authMiddleware, roleMiddleware('secretary', 'admin'), createMeterInstallationFeeBilling)

router.route('/overdue-billing')
.get(authMiddleware,  getOverdueBilling)

router.route('/send-reminder')
.post(authMiddleware, roleMiddleware('treasurer'), sendReminderSMS)

router.route('/update-connection-status').patch(authMiddleware, UpdateWaterConnectionStatus);

module.exports = router   