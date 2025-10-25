const express = require('express')
const router = express.Router()

const {getLatestConnections, getWaterConnections, editResidentAccount} = require('../controller/water-connection')
const authMiddleware = require('../middleware/authentication')

router.route('/').get(authMiddleware,  getWaterConnections)
router.route('/:connection_id').put(authMiddleware,  editResidentAccount)
router.route('/latest-reading').get(authMiddleware,  getLatestConnections)




module.exports = router 


