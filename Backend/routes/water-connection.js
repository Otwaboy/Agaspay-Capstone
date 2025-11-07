const express = require('express')
const router = express.Router()

const {getLatestConnections, getActiveWaterConnections, getAllWaterConnections, getInactiveWaterConnections, editResidentAccount, updateUserContact} = require('../controller/water-connection')
const authMiddleware = require('../middleware/authentication')


router.route('/').get(authMiddleware,  getAllWaterConnections)
router.route('/active').get(authMiddleware,  getActiveWaterConnections)
router.route('/inactive').get(authMiddleware,  getInactiveWaterConnections)
router.route('/:connection_id').put(authMiddleware,  editResidentAccount)
router.route('/latest-reading').get(authMiddleware,  getLatestConnections)
router.route('/contacts-update').patch(authMiddleware,  updateUserContact)




module.exports = router 


