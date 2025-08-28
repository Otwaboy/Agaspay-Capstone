const User = require('../../model/User');
const Resident = require('../../model/Resident');
const WaterConnection = require('../../model/WaterConnection');
const Personnel = require('../../model/Personnel')



const { BadRequestError } = require('../../errors');


const createUser = async (username, password, role = 'resident') => {

  const existingUser = await User.findOne({ username });
  if (existingUser) 
    {
        throw new BadRequestError('Username already taken hehe');
    }

  const user = await User.create({ username, password, role });
  return user;
};


const createResident = async (user_id, first_name, last_name, zone, purok, contact_no) => {
  const resident = await Resident.create({
    user_id,
    first_name,
    last_name,
    zone,
    purok,
    contact_no,
    status: 'active'
  });
  return resident;
};


const createWaterConnection = async (resident_id, meter_no, purok, type) => {
  const connection = await WaterConnection.create({
    resident_id,
    meter_no,
    purok,
    type,
    connection_status: 'pending'
  });
  return connection;
};

const createPesonnel = async (user_id, role, first_name, last_name, email, contact_no, purok, assigned_zone ) => {
  const personnel = await Personnel.create({
    user_id,
    role,
    first_name,
    last_name,
    email,
    purok,
    contact_no,
    assigned_zone,
  });
  return personnel;
};



module.exports = 
{
  createUser,
  createResident, 
  createWaterConnection, 
  createPesonnel 
};
