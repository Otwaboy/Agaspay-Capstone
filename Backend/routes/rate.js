const express = require('express')
const router = express.Router()
const {createRate} = require('../controller/rate')

const authMiddleware = require('../middleware/authentication')
const roleMiddleware = require('../middleware/roleMiddleware')

router.route('/').post(authMiddleware, roleMiddleware('treasurer'), createRate)

module.exports = router 