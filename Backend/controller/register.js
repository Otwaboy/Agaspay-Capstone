

const {createUser, createResident, createWaterConnection, createPesonnel} = require('./auth/auth')
const { StatusCodes } = require('http-status-codes')
const { BadRequestError, UnauthorizedError } = require('../errors')
const User = require('../model/User')
const bcrypt = require('bcrypt')

const registerResident = async (req, res) => {
  
    const { 
           username, 
           password, 
           first_name, 
           last_name, 
           zone, 
           purok, 
           contact_no, 
           meter_no, 
           type,
        } = req.body;

    const user = await createUser(username, password, 'resident');
    const resident = await createResident(user._id, first_name, last_name, zone, purok, contact_no);
    const waterConnection = await createWaterConnection(resident._id, meter_no, purok, type);

    const token = user.createJWT();

    res.status(201).json({
      message: 'Resident was successfully registered ',
      user_id: user._id,
      resident_id: resident._id,
      username: user.username,
      meter_no: waterConnection.meter_no,
      token
    });


}
 
// e register and mga brgy personnel ani
const registerPersonnel = async (req, res) => {
    const { 
           username, 
           password, 
           role,
           first_name, 
           last_name, 
           contact_no,
           assigned_zone, 

        } = req.body;

    const user = await createUser(username, password, role);
    const personnel = await createPesonnel
    (
        user._id,
        role,
        first_name,
        last_name,
        contact_no,
        assigned_zone,
    ) 

     const token = user.createJWT();

    res.status(StatusCodes.CREATED).json(
     {PersonnelField:
         {
      message: 'Barangay Personnel successfully registered their account ',
      user_id: user._id,
      username: user.username,
      personnel_id: personnel._id,
      role: personnel.role,
      assigned_zone: personnel.assigned_zone,
      token
        }
    });


}


//login field
const login = async (req, res) => {
    const {username, password} = req.body

    if(!username || !password ) {
        throw new BadRequestError('username and password cannot be empty boi')
    }

    const user = await User.findOne({username})

    if(!user){
        throw new BadRequestError('username doest not exist')
    }

    const matchpassword = await bcrypt.compare(password, user.password)

    // if not match
    if(!matchpassword){
        throw new UnauthorizedError('password is incorrect')
    }

    const token = user.createJWT();

    res.status(StatusCodes.ACCEPTED).json({userForm: {msg: 'congratulations youre succesfully loginss', username: user.username, role: user.role, token}})
}

module.exports = { registerResident, login, registerPersonnel }; 
