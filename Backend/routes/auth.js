const express = require('express')
const router = express.Router() 

const {registerResident,login, registerPersonnel, getResidentsByDate} = require('../controller/register')
const authMiddleware = require('../middleware/authentication')
const rolemiddleware = require('../middleware/roleMiddleware')

// Public route - no auth required
router.route('/login').post(login)

// Protected routes - require authentication
router.route('/register-resident').post(authMiddleware, rolemiddleware('admin', 'secretary'), registerResident)
router.route('/register-personnel').post(authMiddleware, rolemiddleware('admin'), registerPersonnel)
router.route('/residents/by-date').get(authMiddleware, rolemiddleware('admin', 'secretary'), getResidentsByDate)  

module.exports = router  