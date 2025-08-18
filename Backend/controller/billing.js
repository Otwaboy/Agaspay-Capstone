
const Billing = require('../model/Billing')
const {BadRequestError, UnauthorizedError} = require('../errors')
const {StatusCodes} = require('http-status-codes')
const Reading = require('../model/Meter-reading')
const WaterConnection = require('../model/WaterConnection')
const Resident = require('../model/Resident')





const getBilling = async (req, res) => {
  // i want on this controller that only the connection_id who is login can access his/her billing

  const user = req.user
  let filter = {};

   console.log("Logged-in resident username:", user.username);

  if (user.role === 'resident') {

   // Step 1: Find resident record linked to this user
   // if ang ni login is match sa user_id reference sa resident table it will get the record
    const resident = await Resident.findOne({user_id: user.userId});

    if (!resident) {
      return res.status(StatusCodes.NOT_FOUND).json({
        msg: 'No water connection found for this resident',
        billingDetails: []
      });
    }

     // Step 2: Find the water connection for that resident
     // 
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

  const billingDetails = billings.map(billing => { 
    const connection = billing.connection_id;
    const resident = connection.resident_id;

    return {
      connection_id: connection?._id,
      full_name: resident ? `${resident.first_name} ${resident.last_name}` : 'unknown',
      purok_no: connection?.purok ?? 'unknown',
      total_amount: billing?.total_amount ?? 'unknown'
    };
  });

  res.status(StatusCodes.OK).json({
    msg: 'Billing records retrieved successfully',
    billingDetails
  });
}; 



const createBilling = async (req, res) => {

        const {reading_id, rate_id } = req.body
        const user = req.user

         if (user.role !== 'treasurer') {
            throw new UnauthorizedError('Only treasurer can generate a bill.');
          }

          const reading = await Reading.findById(reading_id)
          if(!reading){
            throw new BadRequestError('Meter reading not found.');
          }

        const billing = await Billing.create
        ({
            connection_id: reading.connection_id,
            reading_id,
            rate_id,
            generated_by: user.userId
        })

        res.status(StatusCodes.CREATED).json({billing})

}


module.exports = {createBilling, getBilling} 