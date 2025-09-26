const express = require('express')
const router = express.Router()
const {createRate, getRate} = require('../controller/rate')

const authMiddleware = require('../middleware/authentication')
const roleMiddleware = require('../middleware/roleMiddleware')

router.route('/')
.post(authMiddleware, roleMiddleware('treasurer'), createRate)
.get(authMiddleware, roleMiddleware('treasurer'), getRate)

module.exports = router 