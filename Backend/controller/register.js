

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
           // Optional scheduling fields
           schedule_installation,
           schedule_date,
           schedule_time,
           assigned_personnel
        } = req.body;

    if (!username || !password || !first_name || !last_name || !zone || !purok || !contact_no || !type) {
      throw new BadRequestError('Please provide all required fields');
    }

    // Validate scheduling fields if scheduling is requested
    if (schedule_installation) {
      console.log('📥 Received scheduling data:', {
        schedule_date,
        schedule_time,
        assigned_personnel
      });
      
      if (!schedule_date || !schedule_time || !assigned_personnel) {
        console.error('❌ Scheduling validation failed:', {
          has_date: !!schedule_date,
          has_time: !!schedule_time,
          has_personnel: !!assigned_personnel
        });
        throw new BadRequestError('Scheduling requires date, time, and assigned personnel');
      }
    }

    // Now safe to create records after authentication and validation
    const user = await createUser(username, password, 'resident');
    const resident = await createResident(user._id, first_name, last_name, email, zone, purok, contact_no, );
    
    // Generate temporary meter number (will be assigned by maintenance during installation)
    const tempMeterNo = `PENDING-${Date.now()}`;
    const waterConnection = await createWaterConnection(resident._id, tempMeterNo, type);
    
    let installationTask = null;
    
    // Create installation task if scheduling was requested
    if (schedule_installation) {
      installationTask = await ScheduleTask.create({
        connection_id: waterConnection._id,
        schedule_date: schedule_date,
        schedule_time: schedule_time,
        task_status: 'Assigned',
        assigned_personnel: assigned_personnel,
        scheduled_by: secretary._id,
      });
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

    // Add task info if scheduling was done
    if (installationTask) {
      responseData.task_id = installationTask._id;
      responseData.scheduled_date = installationTask.schedule_date;
      responseData.scheduled_time = installationTask.schedule_time;
    }

    res.status(201).json(responseData);


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
