const express = require('express')
const router = express.Router()

const {getUserAccount, getAllResidents, checkEmailExists, checkFullNameExists, checkPhoneNumberExists} = require('../controller/ManageUserAccount/manage-user')
const authMiddleware = require('../middleware/authentication')
const roleMiddleware = require('../middleware/roleMiddleware')

// Get current user account
router.route('/').get(authMiddleware, getUserAccount)

// Get all residents (admin only)
router.route('/all').get(authMiddleware, roleMiddleware('admin', 'secretary'), getAllResidents)

// Check if email exists
router.route('/check-email/:email').get(checkEmailExists)
router.route('/check-fullname').get(checkFullNameExists)
router.route('/check-phone/:phone').get(checkPhoneNumberExists)

module.exports = router 