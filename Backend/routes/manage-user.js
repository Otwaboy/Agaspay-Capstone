const express = require('express')
const router = express.Router()

const {getUserAccount} = require('../controller/ManageUserAccount/manage-user')
const authMiddleware = require('../middleware/authentication')



router.route('/').get(authMiddleware, getUserAccount)

module.exports = router