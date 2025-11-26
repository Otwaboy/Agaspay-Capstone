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


const createResident = async (user_id, first_name, last_name, email, zone, purok, contact_no, status ) => {
  const resident = await Resident.create({
    user_id,
    first_name,
    last_name,
    zone,
    purok,
    email,
    contact_no,
    status
  });
  return resident;
};


const createWaterConnection = async (resident_id, meter_no, type, zone, purok) => {
  const connection = await WaterConnection.create({
    resident_id,
    meter_no,
    type,
    zone,
    purok,
    connection_status: 'pending'
  });
  return connection;
};

const createPesonnel = async (user_id, role, first_name, last_name, email, contact_no, purok, assigned_zone) => {
  // Check for duplicate email
  const existingEmail = await Personnel.findOne({ email });
  if (existingEmail) {
    throw new BadRequestError('This email is already in use');
  }

  // Check for duplicate phone/contact number
  const existingContact = await Personnel.findOne({ contact_no });
  if (existingContact) {
    throw new BadRequestError('This phone number is already registered');
  }

  // Check for duplicate full name
  const existingFullName = await Personnel.findOne({ first_name, last_name });
  if (existingFullName) {
    throw new BadRequestError('A personnel with this full name already exists');
  }

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
