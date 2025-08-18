
const express = require('express')

const router = express.Router()

const {payPayment} = require('../controller/payment')
const authMiddleware = require('../middleware/authentication')
const roleMiddleware = require('../middleware/roleMiddleware')

router.route('/').post(authMiddleware, roleMiddleware('resident'), payPayment)

module.exports = router