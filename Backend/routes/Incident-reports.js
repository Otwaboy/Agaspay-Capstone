const express = require('express')
const router = express.Router()

const {createReports} = require('../controller/incident-report')

const authMiddleware = require('../middleware/authentication') 
const roleMiddleware = require('../middleware/roleMiddleware')



router.route('/').post(authMiddleware,  roleMiddleware('meter_reader', 'resident', 'secretary'), createReports)

module.exports = router


