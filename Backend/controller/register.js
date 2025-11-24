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
      type, meter_no, connection_zone, connection_purok
    } = req.body;

    if (!username || !password || !first_name || !last_name || !zone || !purok || !contact_no || !type || !meter_no || !connection_zone || !connection_purok) {
      throw new BadRequestError('Please provide all required fields including meter number and water connection zone/purok');
    }

    const waterConnectionZone = connection_zone;
    const waterConnectionPurok = connection_purok;

    // ✅ Check duplicate full name
    const existingResident = await Resident.findOne(
          { first_name: first_name.trim(), last_name: last_name.trim() }
        );
        if (existingResident) {
          throw new BadRequestError('A resident with the same full name already exists.');
        }

    // ✅ All DB write operations must be attached to the session:
    const user = await User.create([{ username, password, role: 'resident' }], { session });
    const resident = await Resident.create([{ user_id: user[0]._id, first_name, last_name, email, zone, purok, contact_no }], { session });
    const waterConnection = await WaterConnection.create([{ resident_id: resident[0]._id, meter_no, type, zone: waterConnectionZone, purok: waterConnectionPurok }], { session });

    // ✅ AUTOMATIC SCHEDULING: Find available maintenance personnel
    let installationTask = null;
    let assignment = null;
    let autoScheduledMessage = '';

    // Get all active maintenance personnel (exclude archived)
    const maintenancePersonnel = await Personnel.find({
      role: 'maintenance',
      $or: [
        { archive_status: { $exists: false } },
        { archive_status: null },
        { archive_status: { $ne: 'archived' } }
      ]
    }).session(session);

    if (maintenancePersonnel.length > 0) {
      // Define available time slots
      const timeSlots = ['09:30', '10:30', '13:30', '14:30'];

      // Calculate next business day (tomorrow) using Philippine Time (UTC+8)
      const now = new Date();

      // Convert to Philippine Time by adding 8 hours to UTC
      const philippineTime = new Date(now.getTime() + (8 * 60 * 60 * 1000));

      const tomorrow = new Date(philippineTime);
      tomorrow.setUTCDate(philippineTime.getUTCDate() + 1);
      tomorrow.setUTCHours(0, 0, 0, 0);

      const scheduleDate = tomorrow.toISOString().split('T')[0]; // YYYY-MM-DD
      console.log(`[Register] 🇵🇭 Philippine Time: ${philippineTime.toISOString()}`);
      console.log(`[Register] 📅 Philippine date: ${philippineTime.getUTCFullYear()}-${String(philippineTime.getUTCMonth() + 1).padStart(2, '0')}-${String(philippineTime.getUTCDate()).padStart(2, '0')}, Schedule date: ${scheduleDate}`);
      let scheduleTime = null;
      let selectedPersonnel = null;

      // Try to find an available personnel for each time slot
      for (const slot of timeSlots) {
        // Find maintenance personnel who are AVAILABLE (not already assigned) at this date and time
        const availablePersonnel = [];
        const targetDate = new Date(scheduleDate);
        targetDate.setHours(0, 0, 0, 0);

        for (const personnel of maintenancePersonnel) {
          // Check if this personnel has any existing assignment at this exact date and time
          const existingAssignment = await ScheduleTask.findOne({
            assigned_personnel: personnel._id,
            schedule_time: slot
          }).session(session);

          // If assignment exists, check if it's for the same date
          let isBusy = false;
          if (existingAssignment && existingAssignment.schedule_date) {
            const existingDate = new Date(existingAssignment.schedule_date);

            // Compare dates (year, month, day only)
            if (existingDate.getFullYear() === targetDate.getFullYear() &&
                existingDate.getMonth() === targetDate.getMonth() &&
                existingDate.getDate() === targetDate.getDate()) {
              isBusy = true;
            }
          }

          // Only include personnel who have NO assignments at this time (conflict-free)
          if (!isBusy) {
            availablePersonnel.push(personnel);
          }
        }

        console.log(`[Register] Time slot ${slot}: ${availablePersonnel.length}/${maintenancePersonnel.length} personnel available`);

        // If ALL personnel are available for this time slot, use it (best option - no conflicts)
        if (availablePersonnel.length === maintenancePersonnel.length) {
          // Load balancing: Get task counts for all available personnel
          const personnelWithCounts = await Promise.all(
            availablePersonnel.map(async (personnel) => ({
              personnel,
              taskCount: await ScheduleTask.countDocuments({ assigned_personnel: personnel._id }).session(session)
            }))
          );

          // Find the minimum task count
          const minTaskCount = Math.min(...personnelWithCounts.map(p => p.taskCount));

          // Get all personnel with the minimum task count (could be multiple)
          const leastBusyPersonnel = personnelWithCounts.filter(p => p.taskCount === minTaskCount);

          // If multiple personnel have the same minimum task count, pick randomly
          if (leastBusyPersonnel.length > 1) {
            const randomIndex = Math.floor(Math.random() * leastBusyPersonnel.length);
            selectedPersonnel = leastBusyPersonnel[randomIndex].personnel;
            console.log(`[Register] 🎲 Multiple personnel with ${minTaskCount} tasks - randomly selected ${selectedPersonnel.first_name} ${selectedPersonnel.last_name} from ${leastBusyPersonnel.length} options`);
          } else {
            selectedPersonnel = leastBusyPersonnel[0].personnel;
            console.log(`[Register] ✅ Using time slot ${slot} - assigned to ${selectedPersonnel.first_name} ${selectedPersonnel.last_name} (${minTaskCount} existing tasks)`);
          }

          scheduleTime = slot;
          break;
        }

        // If SOME personnel are available, remember this slot as a fallback
        if (availablePersonnel.length > 0 && !selectedPersonnel) {
          // Load balancing: Get task counts for all available personnel
          const personnelWithCounts = await Promise.all(
            availablePersonnel.map(async (personnel) => ({
              personnel,
              taskCount: await ScheduleTask.countDocuments({ assigned_personnel: personnel._id }).session(session)
            }))
          );

          // Find the minimum task count
          const minTaskCount = Math.min(...personnelWithCounts.map(p => p.taskCount));

          // Get all personnel with the minimum task count (could be multiple)
          const leastBusyPersonnel = personnelWithCounts.filter(p => p.taskCount === minTaskCount);

          // If multiple personnel have the same minimum task count, pick randomly
          if (leastBusyPersonnel.length > 1) {
            const randomIndex = Math.floor(Math.random() * leastBusyPersonnel.length);
            selectedPersonnel = leastBusyPersonnel[randomIndex].personnel;
            console.log(`[Register] ⚠️  Partial availability at ${slot} - randomly selected ${selectedPersonnel.first_name} ${selectedPersonnel.last_name} (${minTaskCount} tasks) from ${leastBusyPersonnel.length} options, continuing to check for better slots...`);
          } else {
            selectedPersonnel = leastBusyPersonnel[0].personnel;
            console.log(`[Register] ⚠️  Partial availability at ${slot} - assigned to ${selectedPersonnel.first_name} ${selectedPersonnel.last_name} (${minTaskCount} existing tasks), continuing to check for better slots...`);
          }

          scheduleTime = slot;
          // Don't break - keep checking for a time slot where ALL personnel are free
        }
      }

      // Check if we found an available slot
      if (!selectedPersonnel) {
        // All personnel are busy at all time slots - warn user but still register resident
        autoScheduledMessage = `All maintenance personnel are fully booked for ${scheduleDate}. Please manually schedule meter installation through the Assignments page.`;
      }

      // Only create installation task if we found available personnel
      if (selectedPersonnel) {
        // Create automatic installation task with resident's home address
        const residentLocation = `Zone ${resident[0].zone}, Purok ${resident[0].purok}`;

        installationTask = await ScheduleTask.create([{
          connection_id: waterConnection[0]._id,
          schedule_date: scheduleDate,
          schedule_time: scheduleTime,
          task_status: 'Assigned',
          assigned_personnel: selectedPersonnel._id,
          schedule_type: 'Meter Installation',
          scheduled_by: secretary._id,
          location: residentLocation, // Set location to resident's home address
        }], { session });

        assignment = await Assignment.create([{
          task_id: installationTask[0]._id,
          assigned_to: selectedPersonnel._id,
        }], { session });

        autoScheduledMessage = `Meter installation automatically scheduled for ${scheduleDate} at ${scheduleTime} with ${selectedPersonnel.first_name} ${selectedPersonnel.last_name}.`;
      }
      // If no personnel available, message was already set above
    } else {
      autoScheduledMessage = 'No maintenance personnel available. Please schedule meter installation manually through the Assignments page.';
    }

    await session.commitTransaction();
    session.endSession();

    const token = user[0].createJWT();

    res.status(201).json({
      message: `Resident was successfully registered. ${autoScheduledMessage}`,
      user_id: user[0]._id,
      resident_id: resident[0]._id,
      username: user[0].username,
      connection_id: waterConnection[0]._id,
      connection_status: waterConnection[0].connection_status,
      token,
      task_id: installationTask?.[0]?._id,
      assignment_id: assignment?.[0]?._id,
      auto_scheduled: maintenancePersonnel.length > 0
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
  let isArchived = false;

  if (user.role === "resident") {
    const resident = await Resident.findOne({ user_id: user._id });
    if (resident) {
      fullname = `${resident.first_name} ${resident.last_name}`;

      // Check if resident's water connection is archived
      const waterConnection = await WaterConnection.findOne({ resident_id: resident._id });
      if (waterConnection && waterConnection.archive_status === 'archived') {
        isArchived = true;
      }
    }
  } else {
    const personnel = await Personnel.findOne({ user_id: user._id });
    if (personnel) {
      fullname = `${personnel.first_name} ${personnel.last_name}`;

      // Check if personnel account is archived
      if (personnel.archive_status === 'archived') {
        isArchived = true;
      }
    }
  }

  // Prevent login if account is archived
  if (isArchived) {
    throw new UnauthorizedError('Your account has been archived. Please contact the administrator for assistance.');
  }

    const token = user.createJWT();

    res.status(StatusCodes.ACCEPTED).json({userForm: {msg: 'congratulations youre succesfully loginss',
        username: user.username,
        fullname: fullname  ,
        role: user.role,
        token
    }})
}

// Get residents by date range
const getResidentsByDate = async (req, res) => {
  try {
    const { startDate } = req.query;

    if (!startDate) {
      throw new BadRequestError('Start date is required');
    }

    // Create date range: from startDate to now
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0); // Start of the day

    const end = new Date();
    end.setHours(23, 59, 59, 999); // End of today

    console.log(`📅 Fetching residents from ${start} to ${end}`);

    // Find all residents created within the date range
    const residents = await Resident.find({
      created_at: {
        $gte: start,
        $lte: end
      } 
    }).sort({ created_at: -1 }); // Sort by newest first

    console.log(`✅ Found ${residents.length} residents`);

    // For each resident, get their water connection to get meter_no and type
    const residentsWithDetails = await Promise.all(
      residents.map(async (resident) => {
        const waterConnection = await WaterConnection.findOne({ resident_id: resident._id });

        return {
          _id: resident._id,
          user_id: resident.user_id,
          first_name: resident.first_name,
          last_name: resident.last_name,
          zone: resident.zone,
          purok: resident.purok,
          email: resident.email,
          contact_no: resident.contact_no,
          meter_no: waterConnection?.meter_no || 'N/A',
          type: waterConnection?.type || 'N/A',
          created_at: resident.created_at
        };
      })
    );

    res.status(StatusCodes.OK).json({data: residentsWithDetails});
  } catch (error) {
  console.error('❌ Error fetching residents by date:', error);
  res.status(error.statusCode || 500).json({
    error: error.message || 'Failed to fetch residents',
    stack: error.stack
  });
}
};

module.exports = { registerResident, login, registerPersonnel, getResidentsByDate }; 
