const express = require('express')
const router = express.Router()

const {getLatestConnections, getActiveWaterConnections, getAllWaterConnections, getInactiveWaterConnections, editResidentAccount, updateUserContact, verifyEmail, getConnectionsForDisconnection, getDisconnectedConnections} = require('../controller/water-connection')
const authMiddleware = require('../middleware/authentication')


router.route('/').get(authMiddleware,  getAllWaterConnections)
router.route('/active').get(authMiddleware,  getActiveWaterConnections)
router.route('/inactive').get(authMiddleware,  getInactiveWaterConnections)
router.route('/for-disconnection').get(authMiddleware, getConnectionsForDisconnection)
router.route('/disconnected').get(authMiddleware, getDisconnectedConnections)
router.route('/:connection_id').put(authMiddleware,  editResidentAccount)
router.route('/latest-reading').get(authMiddleware,  getLatestConnections)
router.route('/contacts-update').patch(authMiddleware,  updateUserContact)
router.route('/verify-email').post(authMiddleware, verifyEmail); // <-- new route



 
module.exports = router 


 