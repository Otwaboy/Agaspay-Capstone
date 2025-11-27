const User = require('../../model/User');
const Resident = require('../../model/Resident');
const WaterConnection = require('../../model/WaterConnection');
const Personnel = require('../../model/Personnel')



const { BadRequestError } = require('../../errors');


const createUser = async (username, password, role = 'resident') => {

  const existingUser = await User.findOne({ username });
  if (existingUser) 
    {
        throw new BadRequestError('Username already taken');
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
  // Trim whitespace from names
  const trimmedFirstName = first_name.trim();
  const trimmedLastName = last_name.trim();

  // Check all duplicate fields concurrently to collect all validation errors
  const [existingEmail, existingContact, existingFullName] = await Promise.all([
    Personnel.findOne({ email }),
    Personnel.findOne({ contact_no }),
    Personnel.findOne({
      first_name: { $regex: `^${trimmedFirstName}$`, $options: 'i' },
      last_name: { $regex: `^${trimmedLastName}$`, $options: 'i' }
    })
  ]);

  // Collect all validation errors
  const validationErrors = [];

  if (existingEmail) {
    validationErrors.push('This email is already in use');
  }

  if (existingContact) {
    validationErrors.push('This phone number is already registered');
  }

  if (existingFullName) {
    validationErrors.push('A personnel with this full name already exists');
  }

  // If there are any validation errors, throw them all together
  if (validationErrors.length > 0) {
    throw new BadRequestError(validationErrors.join(' | '));
  }

  const personnel = await Personnel.create({
    user_id,
    role,
    first_name: trimmedFirstName,
    last_name: trimmedLastName,
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
