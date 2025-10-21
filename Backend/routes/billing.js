const express = require('express')
const router = express.Router()
const { createBilling, getBilling, getOverdueBilling, sendReminderSMS} = require('../controller/billing')

const authMiddleware = require('../middleware/authentication')
const roleMiddleware = require('../middleware/roleMiddleware')

router.route('/')
.post(authMiddleware, roleMiddleware('treasurer'), createBilling)
.get(authMiddleware, roleMiddleware('resident' , 'treasurer'), getBilling)

router.route('/overdue-billing')
.get(authMiddleware, roleMiddleware('treasurer'), getOverdueBilling)

router.route('/send-reminder')
.post(authMiddleware, roleMiddleware('treasurer'), sendReminderSMS)

module.exports = router  