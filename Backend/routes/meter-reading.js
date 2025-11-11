const express = require('express')
const router = express.Router()
const {getAllConnectionIDs, inputReading, getLatestReadings, submitReading, updateReadings, approveReading} = require('../controller/meter-reading')

const authMiddleware = require('../middleware/authentication')
const roleMiddleware = require('../middleware/roleMiddleware')


router.route('/')
.get(authMiddleware, roleMiddleware('meter_reader'), getAllConnectionIDs)
.post(authMiddleware, roleMiddleware('meter_reader'), inputReading)

router.route('/latest-readings').get(authMiddleware, roleMiddleware('meter_reader', 'treasurer'), getLatestReadings); // only latest per connection

router.route('/submit-readings').post(authMiddleware, roleMiddleware('meter_reader', 'treasurer'), submitReading); // only latest per connection
router.route('/:reading_id/update-readings').patch(authMiddleware, roleMiddleware('meter_reader', 'treasurer'), updateReadings);
router.route('/approve-readings').patch(authMiddleware, roleMiddleware('meter_reader', 'treasurer'), approveReading);


module.exports = router     