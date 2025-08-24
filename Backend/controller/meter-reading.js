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
    const reading_id = reading? `${reading._id}` : 'not here purok';
    return {
      reading_id: reading_id,
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
  const { connection_id, present_reading, inclusive_date, remarks} = req.body;
  const user = req.user;

  // Validate role
  if (user.role !== 'meter reader') {
    throw new UnauthorizedError('Only meter readers can input readings.');
  }

  // Validate input
  if (!connection_id || present_reading === undefined|| !inclusive_date ) {
    throw new BadRequestError('All fields are required.');
  }

   if (!inclusive_date.start || !inclusive_date.end) {
    throw new BadRequestError('Please porvice inclusive start date and end date');
  }

  // Optional: Validate if connection exists
  const connection = await WaterConnection.findById(connection_id);
  if (!connection) {
    throw new BadRequestError('Water connection not found.');
  }



 // Find the last reading for this connection
  const lastReading = await MeterReading.findOne({connection_id}).sort({created_at: -1});

 // If there's a last reading, use its present as new previous
  const previous_reading = lastReading ? lastReading.present_reading : 0;

 // ✅ Validate present >= previous
    if (present_reading < previous_reading) {
     throw new BadRequestError('Present reading cannot be less than previous reading')
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
    data: reading
  });
};

module.exports = { getAllConnectionIDs, inputReading };
