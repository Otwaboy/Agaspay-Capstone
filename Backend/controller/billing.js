
const Billing = require('../model/Billing')
const {BadRequestError, UnauthorizedError} = require('../errors')
const {StatusCodes} = require('http-status-codes')
const Reading = require('../model/Meter-reading')
const WaterConnection = require('../model/WaterConnection')
const Resident = require('../model/Resident')
const MeterReading = require('../model/Meter-reading')



const getBilling = async (req, res) => {
  const user = req.user;
  let filter = {};

  console.log("Logged-in resident username:", user.username);

  if (user.role === 'resident') {
    // Step 1: Find resident record linked to this user
    const resident = await Resident.findOne({ user_id: user.userId });

    if (!resident) {
      return res.status(StatusCodes.NOT_FOUND).json({
        msg: 'No water connection found for this resident',
        billingDetails: []
      });
    }

    // Step 2: Find the water connection for that resident
    const connection = await WaterConnection.findOne({ resident_id: resident._id });
    if (!connection) {
      return res.status(StatusCodes.NOT_FOUND).json({
        msg: 'No water connection found for this resident',
        billingDetails: []
      });
    }

    // Step 3: Filter by that connection
    filter.connection_id = connection._id;
  }

  // Step 4: Get the billings
  const billings = await Billing.find(filter).populate({
    path: 'connection_id',
    populate: {
      path: 'resident_id',
      select: 'first_name last_name'
    }
  });

  // Step 5: Attach meter reading info
  const billingDetails = await Promise.all(
    billings.map(async (billing) => {
      const connection = billing.connection_id;
      const resident = connection.resident_id;

      // ✅ Find latest reading for this connection
     const reading = await MeterReading.findById(billing.reading_id);

      return {
        bill_id: billing?._id ?? 'unknown',
        connection_id: connection?._id,
        full_name: resident ? `${resident.first_name} ${resident.last_name}` : 'unknown',
        meter_no: connection?.meter_no,
        purok_no: connection?.purok ?? 'unknown',
        total_amount: billing?.total_amount ?? 'unknown',
        status: billing?.status ?? 'unknown',

        // ✅ Add these fields
        previous_reading: reading?.previous_reading ?? 0,
        present_reading: reading?.present_reading ?? 0,
        calculated: reading?.calculated ?? 0,
        due_date: billing?.due_date ?? 0,
        created_at: reading?.created_at
      };
    })
  );

  res.status(StatusCodes.OK).json({
    msg: 'Billing records retrieved successfully',
    data: billingDetails
  });
};


 




/**
 * Controller: createBilling
 *
 * What it does:
 *  - Only the treasurer can generate a bill
 *  - Ensures the reading exists
 *  - Prevents duplicate bills for the same reading
 *  - Always saves reading_id as an ObjectId (not a raw string)
 *  - Logs and verifies the save so we know DB is consistent
 */
const createBilling = async (req, res) => {
  try {
    const { reading_id, rate_id, due_date } = req.body;
    const user = req.user;

    // ✅ Only treasurer can generate bills
    if (user.role !== 'treasurer') {
      throw new UnauthorizedError('Only treasurer can generate a bill.');
    }

    // ✅ Make sure the reading exists
    const reading = await MeterReading.findById(reading_id);
    if (!reading) {
      throw new BadRequestError('Meter reading not found.');
    }

    // ✅ Prevent duplicates (check if a bill already exists for this reading)
    // Using $or lets us match whether reading_id is stored as ObjectId or as string
    const existingBill = await Billing.findOne({
      $or: [
        { reading_id: reading._id },
        { reading_id: reading._id.toString() }
      ]
    });

    if (existingBill) {
      return res.status(StatusCodes.CONFLICT).json({
        message: 'A bill already exists for this reading.',
        billing: existingBill
      });
    }

    // ✅ Create billing, saving reading_id as ObjectId (not raw req.body string)
    const billing = await Billing.create({
      connection_id: reading.connection_id,
      reading_id: reading._id,  // always ObjectId
      rate_id,
      due_date,
      generated_by: user.userId
    });

    // 🪵 Debug logs so we can see exactly what was saved
    console.log('🧾 Billing created:');
    console.log('- reading._id:', reading._id);
    console.log('- saved billing._id:', billing._id);
    console.log('- saved billing.reading_id (raw):', billing.reading_id);

    // Extra verification to confirm DB consistency
    const verify1 = await Billing.findOne({ reading_id: billing.reading_id });
    const verify2 = await Billing.findOne({ reading_id: billing.reading_id.toString() });
    console.log('🔎 Verify billing find by ObjectId:', !!verify1, ' by string:', !!verify2);

    return res.status(StatusCodes.CREATED).json({ billing });
  } catch (error) {
    console.error('🔥 createBilling error:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Failed to create billing',
      error: error.message
    });
  }
};




module.exports = {createBilling, getBilling} 