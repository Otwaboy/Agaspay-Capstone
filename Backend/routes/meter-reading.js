const express = require('express')
const router = express.Router()
const {getAllConnectionIDs, inputReading, getLatestReadings, submitReading, updateReadings, approveReading, getSubmittedReadings, getApprovalStats, getReadingHistory, updateInclusiveDate, syncInclusiveDates} = require('../controller/meter-reading')

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

// Get reading history (all readings, not just latest)
router.route('/reading-history')
  .get(authMiddleware, roleMiddleware('admin', 'treasurer'), getReadingHistory);

// Admin/Meter Reader endpoint to manually update inclusive_date for a water connection (testing purposes)
router.route('/admin/update-inclusive-date')
  .patch(authMiddleware, roleMiddleware('admin', 'meter_reader'), updateInclusiveDate);

// Admin endpoint to sync WaterConnection inclusive_date from latest readings
router.route('/admin/sync-inclusive-dates')
  .post(authMiddleware, roleMiddleware('admin'), syncInclusiveDates);

module.exports = router     