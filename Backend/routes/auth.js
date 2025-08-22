const express = require('express')
const router = express.Router()

const {registerResident,login, registerPersonnel} = require('../controller/register')

router.route('/register-resident').post(registerResident)
router.route('/register-personnel').post(registerPersonnel)
router.route('/login').post(login)

module.exports = router 