const express = require('express')
const router = express.Router()

const {getUserAccount, getAllResidents} = require('../controller/ManageUserAccount/manage-user')
const authMiddleware = require('../middleware/authentication')
const roleMiddleware = require('../middleware/roleMiddleware')

// Get current user account
router.route('/').get(authMiddleware, getUserAccount)

// Get all residents (admin only)
router.route('/all').get(authMiddleware, roleMiddleware('admin', 'secretary'), getAllResidents)

module.exports = router 