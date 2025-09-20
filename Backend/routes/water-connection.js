const express = require('express')
const router = express.Router()

const {getLatestConnections, getWaterConnections} = require('../controller/water-connection')
const authMiddleware = require('../middleware/authentication')

router.route('/').get(authMiddleware,  getWaterConnections)
router.route('/latest-reading').get(authMiddleware,  getLatestConnections)


module.exports = router 


