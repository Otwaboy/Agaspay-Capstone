const express = require('express')
const router = express.Router()

const {getAllConnections} = require('../controller/water-connection')
const authMiddleware = require('../middleware/authentication')

router.route('/').get(authMiddleware,  getAllConnections)

module.exports = router 


