const express = require('express')
const router = express.Router()
const {getAllConnectionIDs, inputReading} = require('../controller/meter-reading')

const authMiddleware = require('../middleware/authentication')
const roleMiddleware = require('../middleware/roleMiddleware')


router.route('/')
.get(authMiddleware, roleMiddleware('meter reader'), getAllConnectionIDs)
.post(authMiddleware, roleMiddleware('meter reader'), inputReading)

module.exports = router   