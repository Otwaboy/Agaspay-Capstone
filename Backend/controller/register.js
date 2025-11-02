

const {createUser, createResident, createWaterConnection, createPesonnel} = require('./auth/auth')
const { StatusCodes } = require('http-status-codes')
const { BadRequestError, UnauthorizedError } = require('../errors')
const User = require('../model/User')
const Resident = require('../model/Resident')
const Personnel = require('../model/Personnel')
const WaterConnection = require('../model/WaterConnection')
const ScheduleTask = require('../model/Schedule-task')
const bcrypt = require('bcrypt')

const registerResident = async (req, res) => {
  
    // CRITICAL: Validate authentication FIRST before any database operations
    if (!req.user || !req.user.userId) {
      throw new BadRequestError('Authentication required. Please log in as Secretary or Admin.');
    }

    // Verify secretary/admin personnel record exists
    const secretary = await Personnel.findOne({ user_id: req.user.userId });
    if (!secretary) {
      throw new BadRequestError('Personnel record not found. Only Secretary or Admin can create residents.');
    }

    // Validate required fields from request body
    const { 
           username, 
           password, 
           first_name, 
           last_name, 
           zone,
           email, 
           purok, 
           contact_no, 
           type,
        } = req.body;

    if (!username || !password || !first_name || !last_name || !zone || !purok || !contact_no || !type) {
      throw new BadRequestError('Please provide all required fields');
    }

    // Now safe to create records after authentication and validation
    const user = await createUser(username, password, 'resident');
    const resident = await createResident(user._id, first_name, last_name, email, zone, purok, contact_no, );
    
    // Generate temporary meter number (will be assigned by maintenance during installation)
    const tempMeterNo = `PENDING-${Date.now()}`;
    const waterConnection = await createWaterConnection(resident._id, tempMeterNo, type);
    
    // Schedule installation for tomorrow at 9 AM
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);

    const installationTask = await ScheduleTask.create({
      connection_id: waterConnection._id,
      schedule_date: tomorrow,
      schedule_time: '09:00',
      task_status: 'Unassigned',
      scheduled_by: secretary._id,
    });

    const token = user.createJWT();

    res.status(201).json({
      message: 'Resident was successfully registered. Meter installation task has been scheduled for tomorrow at 9:00 AM.',
      user_id: user._id,
      resident_id: resident._id,
      username: user.username,
      connection_id: waterConnection._id,
      connection_status: waterConnection.connection_status,
      task_id: installationTask._id,
      scheduled_date: installationTask.schedule_date,
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
           purok,
           email,
           assigned_zone, 

        } = req.body;



    const user = await createUser(username, password, role);
    const personnel = await createPesonnel
    (
        user._id,
        role,
        first_name,
        last_name,
        email,
        contact_no,
        purok,
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
      contact_no: personnel.contact_no,
      email: personnel.email,
      purok: personnel.purok,
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

  let fullname = "";

  if (user.role === "resident") {
    const resident = await Resident.findOne({ user_id: user._id });
    if (resident) fullname = `${resident.first_name} ${resident.last_name}`;
  } else {
    const personnel = await Personnel.findOne({ user_id: user._id });
    if (personnel) fullname = `${personnel.first_name} ${personnel.last_name}`;
  }

  

    const token = user.createJWT();

    res.status(StatusCodes.ACCEPTED).json({userForm: {msg: 'congratulations youre succesfully loginss',  
        username: user.username,
        fullname: fullname  ,
        role: user.role, 
        token
    }})
}

module.exports = { registerResident, login, registerPersonnel }; 
