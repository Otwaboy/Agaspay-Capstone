
const express = require('express')

const router = express.Router()

const {payPayment, getPayment, updatePaymentStatus} = require('../controller/payment')
const authMiddleware = require('../middleware/authentication')
const roleMiddleware = require('../middleware/roleMiddleware')

router.route('/').post(authMiddleware, roleMiddleware('resident'), payPayment).get(authMiddleware, getPayment)
router.route('/:id').patch(authMiddleware, roleMiddleware('treasurer'), updatePaymentStatus)

module.exports = router 