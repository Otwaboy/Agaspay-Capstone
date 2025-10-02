const express = require('express')
const router = express.Router()
const {getAllConnectionIDs, inputReading, getLatestReadings} = require('../controller/meter-reading')

const authMiddleware = require('../middleware/authentication')
const roleMiddleware = require('../middleware/roleMiddleware')


router.route('/')
.get(authMiddleware, roleMiddleware('meter_reader'), getAllConnectionIDs)
.post(authMiddleware, roleMiddleware('meter_reader'), inputReading)

router.route('/latest-readings').get(authMiddleware, roleMiddleware('meter_reader', 'treasurer'), getLatestReadings); // only latest per connection

module.exports = router   