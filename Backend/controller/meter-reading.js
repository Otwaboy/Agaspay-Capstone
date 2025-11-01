const { StatusCodes } = require('http-status-codes');
const MeterReading = require('../model/Meter-reading'); 
const WaterConnection = require('../model/WaterConnection');
const Personnel = require('../model/Personnel');

const {UnauthorizedError, BadRequestError} = require('../errors')

 
const getAllConnectionIDs = async (req, res) => {

    const user = req.user

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
  if (user.role !== 'meter_reader') {
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

 

//fetch

// ✅ Get latest reading per water connection
/**
 * Controller: getLatestReadings
 *
 * What it does:
 *  - FILTERS by meter reader's assigned zone (SECURITY: meter readers can only see their zone)
 *  - For each connection, fetch the latest meter reading
 *  - Join resident info
 *  - Check if that reading already has a billing record
 *  - Uses $toString on both sides to avoid ObjectId vs string mismatch
 *  - Tries both "Billing" and "billings" collection names (Mongoose sometimes pluralizes)
 *  - Returns clean JSON with `is_billed: true/false`
 */
const getLatestReadings = async (req, res) => {
  try {
    console.log('🚀 getLatestReadings called by user:', req.user);
    
    // 🔒 SECURITY: Get the meter reader's assigned zone
    const { userId, role } = req.user;
    
    let zoneFilter = {};
    
    // If user is a meter reader, enforce zone-based filtering
    if (role === 'meter_reader') {
      console.log('👤 Fetching personnel record for user_id:', userId);
      const personnel = await Personnel.findOne({ user_id: userId }).select('assigned_zone');
      console.log('👤 Personnel found:', personnel);
      
      if (!personnel || !personnel.assigned_zone) {
        console.log('❌ No personnel found or no assigned_zone');
        return res.status(StatusCodes.FORBIDDEN).json({
          message: "Meter reader must have an assigned zone",
          connection_details: [],
          total: 0
        });
      }
      
      // Filter connections by zone
      zoneFilter = { zone: personnel.assigned_zone };
      console.log('🔐 Zone filter applied for meter reader:', { 
        userId, 
        assigned_zone: personnel.assigned_zone,
        zoneFilter
      });
    } else {
      console.log('💼 User is treasurer/admin - no zone filter applied');
    }
    // Treasurer can see all zones, so no filter needed
    
    const readings = await WaterConnection.aggregate([
      // 1️⃣ Attach resident info FIRST (we need this to filter by zone)
      {
        $lookup: {
          from: "residents",
          localField: "resident_id",
          foreignField: "_id",
          as: "resident"
        }
      },
      { $unwind: { path: "$resident", preserveNullAndEmptyArrays: true } },

      // 2️⃣ FILTER BY ZONE (zone is in resident, not connection)
      ...(Object.keys(zoneFilter).length > 0 ? [{ 
        $match: { 
          "resident.zone": zoneFilter.zone 
        } 
      }] : []),
      
      // 3️⃣ Get the latest meterreading for each connection
      {
        $lookup: {
          from: "meterreadings",
          let: { connId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$connection_id", "$$connId"] } } },
            { $sort: { created_at: -1 } },
            { $limit: 1 }
          ],
          as: "latestReading"
        }
      },
      { $unwind: { path: "$latestReading", preserveNullAndEmptyArrays: true } },

      // 4️⃣ Check if billing exists for that reading
      //    We do two lookups because collection might be named "Billing" or "billings"
      {
        $lookup: {
          from: "Billing",
          let: { readingId: "$latestReading._id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: [
                    { $toString: "$reading_id" }, // convert both sides to string
                    { $toString: "$$readingId" }
                  ]
                }
              }
            },
            { $limit: 1 }
          ],
          as: "billingA"
        }
      },
      {
        $lookup: {
          from: "billings",
          let: { readingId: "$latestReading._id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: [
                    { $toString: "$reading_id" },
                    { $toString: "$$readingId" }
                  ]
                }
              }
            },
            { $limit: 1 }
          ],
          as: "billingB"
        }
      },

      // 4️⃣ Add a flag (true if billing found in either collection)
      {
        $addFields: {
          is_billed: {
            $gt: [
              { $add: [ { $size: "$billingA" }, { $size: "$billingB" } ] },
              0
            ]
          }
        }
      }
    ]);

    // 5️⃣ Format the response to make it frontend-friendly
    const connectionDetails = readings.map(item => {
      const reading = item.latestReading;
      const resident = item.resident;

      // 📅 Check if reading was done in the current month (UTC-based to avoid timezone issues)
      let read_this_month = false;
      if (reading?.created_at) {
        const readingDate = new Date(reading.created_at);
        const now = new Date();
        
        // Use UTC methods to ensure consistent month/year comparison across all timezones
        // This prevents readings from being misclassified when server timezone != user timezone
        read_this_month = (
          readingDate.getUTCMonth() === now.getUTCMonth() &&
          readingDate.getUTCFullYear() === now.getUTCFullYear()
        );
      }

      return {
        reading_id: reading?._id ? reading._id.toString() : null,
        connection_id: item._id ? item._id.toString() : null,
        connection_type: item.type || "Unknown", // ✅ Fetch from WaterConnection
        inclusive_date: reading?.inclusive_date || null,
        full_name: resident ? `${resident.first_name} ${resident.last_name}` : "Unknown",
        purok_no: resident?.purok || "not here purok",
        zone: resident?.zone || null, // Include zone from resident for display/debugging
        previous_reading: reading?.previous_reading ?? 0,
        present_reading: reading?.present_reading ?? 0,
        calculated: reading?.calculated ?? 0,
        is_billed: !!item.is_billed,
        read_this_month: read_this_month, // ✅ Monthly status tracker
        last_read_date: reading?.created_at || null // For reference
      };
    });

    console.log('📊 Total raw results from aggregation:', readings.length);
    console.log('📊 First 3 aggregation results:', readings.slice(0, 3).map(r => ({
      connection_id: r._id,
      resident_name: r.resident ? `${r.resident.first_name} ${r.resident.last_name}` : 'Unknown',
      resident_zone: r.resident?.zone,
      has_reading: !!r.latestReading
    })));

    // 🪵 Debug log for zone filtering
    if (role === 'meter_reader') {
      console.log('📊 Zone filter results:', {
        total_connections_found: connectionDetails.length,
        zones_in_results: [...new Set(connectionDetails.map(c => c.zone))]
      });
    }

    console.log('✅ Returning response with', connectionDetails.length, 'connections');

    return res.status(StatusCodes.OK).json({
      message: "Latest reading per connection fetched",
      connection_details: connectionDetails,
      total: connectionDetails.length
    });
  } catch (error) {
    console.error('🔥 getLatestReadings error:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Failed to fetch latest readings",
      error: error.message
    });
  }
};






module.exports = { getAllConnectionIDs, inputReading, getLatestReadings };
