const express = require('express')
const router = express.Router() 

const {sendEmailVerificationCode, verifyEmailAndRegisterResident, login, registerPersonnel, getResidentsByDate} = require('../controller/register')
const authMiddleware = require('../middleware/authentication')
const rolemiddleware = require('../middleware/roleMiddleware')

// Public route - no auth required
router.route('/login').post(login)

// Email verification - no auth required (anyone can request verification)
router.route('/send-email-verification').post(sendEmailVerificationCode)

// Protected routes - require authentication
router.route('/register-resident').post(authMiddleware, rolemiddleware('admin', 'secretary'), verifyEmailAndRegisterResident)
router.route('/register-personnel').post(authMiddleware, rolemiddleware('admin'), registerPersonnel)
router.route('/residents/by-date').get(authMiddleware, rolemiddleware('admin', 'secretary'), getResidentsByDate)  

module.exports = router  