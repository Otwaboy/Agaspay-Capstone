
const express = require('express')

const router = express.Router()

const {payPayment, getPayment, updatePaymentStatus, verifyPayment, recordManualPayment} = require('../controller/payment')
const authMiddleware = require('../middleware/authentication')
const roleMiddleware = require('../middleware/roleMiddleware')

router.route('/').post(authMiddleware, roleMiddleware('resident'), payPayment).get(authMiddleware, getPayment)
router.route('/verify').get(authMiddleware, verifyPayment)
router.route('/record-manual').post(authMiddleware, roleMiddleware('treasurer'), recordManualPayment)
router.route('/:id').patch(authMiddleware, roleMiddleware('treasurer'), updatePaymentStatus)

module.exports = router 