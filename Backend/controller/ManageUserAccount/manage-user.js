const WaterConnection = require('../../model/WaterConnection')
const Resident = require('../../model/Resident')
const Personnel = require('../../model/Personnel')
const { UnauthorizedError, BadRequestError } = require('../../errors')

// Get all residents (for admin)
const getAllResidents = async (req, res) => {
  try {
    const { status, search } = req.query;
    
    // Build filter query
    let filter = {};
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    // Fetch all residents with their water connections
    const residents = await Resident.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .lean();
    
    // Get water connections for each resident
    const residentsWithConnections = await Promise.all(
      residents.map(async (resident) => {
        const connection = await WaterConnection.findOne({ resident_id: resident._id });
        return {
          ...resident,
          meter_number: connection?.meter_no || null,
          zone: resident.zone || null,
          purok: resident.purok || null,
          connection_status: connection?.connection_status || null
        };
      })
    );
    
    res.status(200).json({
      success: true,
      users: residentsWithConnections,
      count: residentsWithConnections.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getUserAccount = async (req, res) => {
  const user = req.user  // this comes from your auth middleware

  if (!user) {
    throw new UnauthorizedError('Invalid Account')
  }

  let userData

  if (user.role === 'resident') {
    // Fetch resident with their water connection
    const resident = await Resident.findOne({user_id: user.userId})
    if (!resident) {
      throw new BadRequestError('Resident not found')
    }

    const connection = await WaterConnection.findOne({ resident_id: resident._id })

    userData = {
      id: resident._id,
      fullname: `${resident.first_name} ${resident.last_name}`, 
      username: resident.username,
      role: resident.role,
      meter_no: connection?.meter_no || null,
      status: connection?.connection_status || null,
      purok: resident?.purok || null,
      zone: resident?.zone || null,
      type: connection?.type || null,
    }

  } else if (user.role === 'treasurer' || user.role === 'admin' || user.role === 'meter_reader' || user.role === 'secretary' || user.role === 'maintenance') {
   
    // Fetch personnel
    const personnel = await Personnel.findOne({user_id: user.userId})
    if (!personnel) {
      throw new BadRequestError('Personnel not found')
    }

    userData = {
      id: personnel._id,
      fullname: `${personnel.first_name} ${personnel.last_name}`, 
      username: personnel.username,
      role: personnel.role,
      assigned_zone: personnel.assigned_zone
    }
  } else {
    throw new UnauthorizedError('Unknown role')
  }

  return res.status(200).json({
    success: true,
    user: userData
  })
}
 
module.exports = { getUserAccount, getAllResidents }
