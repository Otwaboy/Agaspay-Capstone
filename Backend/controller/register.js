

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

const mongoose = require("mongoose");

const registerResident = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (!req.user || !req.user.userId) {
      throw new BadRequestError('Authentication required. Please log in as Secretary or Admin.');
    }

    const secretary = await Personnel.findOne({ user_id: req.user.userId });
    if (!secretary) {
      throw new BadRequestError('Personnel record not found. Only Secretary or Admin can create residents.');
    }

    const { 
      username, password, first_name, last_name, zone, email, purok, contact_no,
      type, meter_no, schedule_installation, schedule_date, schedule_time, assigned_personnel
    } = req.body;

    if (!username || !password || !first_name || !last_name || !zone || !purok || !contact_no || !type || !meter_no) {
      throw new BadRequestError('Please provide all required fields including meter number');
    }

    // ✅ Check duplicate full name
    const existingResident = await Resident.findOne(
          { first_name: first_name.trim(), last_name: last_name.trim() }
        );
        if (existingResident) {
          throw new BadRequestError('A resident with the same full name already exists.');
        }

    if (schedule_installation && (!schedule_date || !schedule_time || !assigned_personnel)) {
      throw new BadRequestError('Scheduling requires date, time, and assigned personnel');
    }

    // ✅ All DB write operations must be attached to the session:
    const user = await User.create([{ username, password, role: 'resident' }], { session });
    const resident = await Resident.create([{ user_id: user[0]._id, first_name, last_name, email, zone, purok, contact_no }], { session });
    const waterConnection = await WaterConnection.create([{ resident_id: resident[0]._id, meter_no, type }], { session });

    let installationTask = null;
    let assignment = null;

    if (schedule_installation) {
      installationTask = await ScheduleTask.create([{
        connection_id: waterConnection[0]._id,
        schedule_date,
        schedule_time,
        task_status: 'Assigned',
        assigned_personnel,
        schedule_type: 'Meter Installation', 
        scheduled_by: secretary._id,
      }], { session });

      assignment = await Assignment.create([{
        task_id: installationTask[0]._id,
        assigned_to: assigned_personnel,
      }], { session });
    }

    await session.commitTransaction();
    session.endSession();

    const token = user[0].createJWT();

    res.status(201).json({
      message: schedule_installation 
        ? `Resident was successfully registered. Meter installation scheduled for ${schedule_date} at ${schedule_time}.`
        : 'Resident was successfully registered. Please schedule meter installation through the Assignments page.',
      user_id: user[0]._id,
      resident_id: resident[0]._id,
      username: user[0].username,
      connection_id: waterConnection[0]._id,
      connection_status: waterConnection[0].connection_status,
      token,
      task_id: installationTask?.[0]?._id,
      assignment_id: assignment?.[0]?._id
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("❌ Registration failed, all changes rolled back:", error);
    res.status(400).json({ error: error.message });
  }
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
