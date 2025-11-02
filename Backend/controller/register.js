

const {createUser, createResident, createWaterConnection, createPesonnel} = require('./auth/auth')
const { StatusCodes } = require('http-status-codes')
const { BadRequestError, UnauthorizedError } = require('../errors')
const User = require('../model/User')
const Resident = require('../model/Resident')
const Personnel = require('../model/Personnel')
const WaterConnection = require('../model/WaterConnection')
const ScheduleTask = require('../model/Schedule-task')
const Assignment = require('../model/Assignment')
const bcrypt = require('bcrypt')

const registerResident = async (req, res) => {
  if (!req.user || !req.user.userId) {
    throw new BadRequestError('Authentication required. Please log in as Secretary or Admin.');
  }

  const secretary = await Personnel.findOne({ user_id: req.user.userId });
  if (!secretary) {
    throw new BadRequestError('Personnel record not found. Only Secretary or Admin can create residents.');
  }

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
    schedule_installation,
    schedule_date,
    schedule_time,
    assigned_personnel
  } = req.body;

  if (!username || !password || !first_name || !last_name || !zone || !purok || !contact_no || !type) {
    throw new BadRequestError('Please provide all required fields');
  }

  if (schedule_installation) {
    if (!schedule_date || !schedule_time || !assigned_personnel) {
      throw new BadRequestError('Scheduling requires date, time, and assigned personnel');
    }
  }

  const user = await createUser(username, password, 'resident');
  const resident = await createResident(user._id, first_name, last_name, email, zone, purok, contact_no);
  
  const tempMeterNo = `PENDING-${Date.now()}`;
  const waterConnection = await createWaterConnection(resident._id, tempMeterNo, type);
  
  let installationTask = null;
  let assignment = null;

  if (schedule_installation) {
    // 1. Create the ScheduleTask
    installationTask = await ScheduleTask.create({
      connection_id: waterConnection._id,
      schedule_date,
      schedule_time,
      task_status: 'Scheduled',
      assigned_personnel,
      schedule_type: 'Meter Installation',
      scheduled_by: secretary._id,
    });

    // 2. Create the Assignment (links task to personnel) - just like assignment controller
    assignment = await Assignment.create({
      task_id: installationTask._id,
      assigned_to: assigned_personnel,
    });

    console.log('✅ Created ScheduleTask:', installationTask._id);
    console.log('✅ Created Assignment:', assignment._id);
  }

  const token = user.createJWT();

  const responseData = {
    message: schedule_installation 
      ? `Resident was successfully registered. Meter installation scheduled for ${schedule_date} at ${schedule_time}.`
      : 'Resident was successfully registered. Please schedule meter installation through the Assignments page.',
    user_id: user._id,
    resident_id: resident._id,
    username: user.username,
    connection_id: waterConnection._id,
    connection_status: waterConnection.connection_status,
    token
  };

  if (installationTask) {
    responseData.task_id = installationTask._id;
    responseData.scheduled_date = installationTask.schedule_date;
    responseData.scheduled_time = installationTask.schedule_time;
    
    // Add assignment info if created
    if (assignment) {
      responseData.assignment_id = assignment._id;
    }
  }

  res.status(201).json(responseData);
};


 
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
