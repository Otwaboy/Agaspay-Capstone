const express = require('express')
const router = express.Router()
const {getAllConnectionIDs, inputReading, getLatestReadings, submitReading, updateReadings, approveReading, getSubmittedReadings, getApprovalStats, getMeterReaderDailyStats} = require('../controller/meter-reading')

const authMiddleware = require('../middleware/authentication')
const roleMiddleware = require('../middleware/roleMiddleware')


router.route('/')
.get(authMiddleware, roleMiddleware('meter_reader'), getAllConnectionIDs)
.post(authMiddleware, roleMiddleware('meter_reader'), inputReading)

router.route('/latest-readings').get(authMiddleware, roleMiddleware('meter_reader', 'treasurer'), getLatestReadings); // only latest per connection

router.route('/submit-readings').post(authMiddleware, roleMiddleware('meter_reader', 'treasurer'), submitReading); // only latest per connection
router.route('/:reading_id/update-readings').patch(authMiddleware, roleMiddleware('meter_reader', 'treasurer'), updateReadings);
router.route('/approve-readings').patch(authMiddleware, roleMiddleware('meter_reader', 'treasurer'), approveReading);


// // Approve individual reading
// router.route('/:id/approve')
//   .patch(authMiddleware, roleMiddleware('treasurer'), approveSingleReading);

router.route('/submitted-readings')
  .get(authMiddleware, roleMiddleware('treasurer'), getSubmittedReadings);

// Get approval statistics
router.route('/approval-stats')
  .get(authMiddleware, roleMiddleware('treasurer'), getApprovalStats);

// Get meter reader daily stats
router.route('/daily-stats')
  .get(authMiddleware, roleMiddleware('meter_reader'), getMeterReaderDailyStats);

module.exports = router     