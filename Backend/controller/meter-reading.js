const { StatusCodes } = require('http-status-codes');
const MeterReading = require('../model/Meter-reading');
const WaterConnection = require('../model/WaterConnection');

const {UnauthorizedError, BadRequestError} = require('../errors')


const getAllConnectionIDs = async (req, res) => {

  const readings = await MeterReading.find({})
    .populate({
      path: 'connection_id',
      populate: {
        path: 'resident_id', // assuming this field exists inside WaterConnection
        select: 'first_name last_name' // adjust this if your schema differs
      }
    });

  const connectionDetails = readings.map(reading => {
    const connection = reading.connection_id;
    const resident = connection?.resident_id; // the ? will return without creashing

    const inclusive_date = `${reading.inclusive_date}`
    const fullName = resident ? `${resident.first_name} ${resident.last_name}` : 'Unknown';
    const purok = connection ? `${connection.purok}` : 'not here purok';
    const previous_reading = reading ? `${reading.previous_reading}` : 'not here purok';
    const present_reading = reading ? `${reading.present_reading}` : 'not here purok';
    const calculated = reading ? `${reading.calculated}` : 'not here purok';
    return {
      connection_id: connection?._id,
      inclusive_date: inclusive_date,
      full_name: fullName,
      purok_no: purok,
      previous_reading: previous_reading,
      present_reading: present_reading,
      calculated: calculated
    };
  });

  res.status(StatusCodes.OK).json({
    message: 'All resident names with connection IDs fetched',
    connection_details: connectionDetails,
    total: connectionDetails.length
  });
};




const inputReading = async (req, res) => {
  const { connection_id, previous_reading, present_reading, inclusive_date, remarks} = req.body;
  const user = req.user;

  // Validate role
  if (user.role !== 'meter reader') {
    throw new UnauthorizedError('Only meter readers can input readings.');
  }

  // Validate input
  if (!connection_id || previous_reading === undefined || present_reading === undefined) {
    throw new BadRequestError('All fields are required.');
  }

  if (present_reading < previous_reading) {
    throw new BadRequestError('Present reading must be greater than or equal to previous.');
  }

   if (!inclusive_date) {
    throw new BadRequestError('Please porvice inclusive date');
  }

  // Optional: Validate if connection exists
  const connection = await WaterConnection.findById(connection_id);
  if (!connection) {
    throw new BadRequestError('Water connection not found.');
  }

  // Create meter reading
  const reading = await MeterReading.create({
    connection_id,
    inclusive_date,
    previous_reading,
    present_reading,
    calculated: present_reading - previous_reading,
    remarks,
    recorded_by: user.userId, // assuming userId is stored in the JWT
  });

  res.status(StatusCodes.CREATED).json({
    message: 'Meter reading successfully recorded',
    reading
  });
};

module.exports = { getAllConnectionIDs, inputReading };
