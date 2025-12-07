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
  const { connection_id, present_reading, inclusive_date, remarks, can_read_status } = req.body;
  const user = req.user;

  // Validate role
  if (user.role !== 'meter_reader') {
    throw new UnauthorizedError('Only meter readers can input readings.');
  }

  // Validate input
  if (!connection_id || present_reading === undefined) {
    throw new BadRequestError('Connection ID and present reading are required.');
  }

  // Validate remarks if cannot read
  if (can_read_status === 'cannot_read' && !remarks) {
    throw new BadRequestError('Please provide remarks explaining why the meter cannot be read');
  }

  const connection = await WaterConnection.findById(connection_id).populate('resident_id');
  if (!connection) {
    throw new BadRequestError('Water connection not found.');
  }

  // Check meter reader's assigned zone
  const personnel = await Personnel.findOne({ user_id: user.userId }).select('assigned_zone');
  if (!personnel || !personnel.assigned_zone) {
    throw new BadRequestError('Meter reader has no assigned zone.');
  }

  // Check water connection zone (not resident's home zone)
  // Resident zone is for incident reporting; water connection zone is for meter coverage
  if (connection.zone !== personnel.assigned_zone) {
    throw new UnauthorizedError(
      `You are only allowed to input readings for zone ${personnel.assigned_zone}. This connection is in zone ${connection.zone}.`
    );
  }

  // 📅 Use inclusive_date from connection or from request (if provided for manual override)
  let readingInclusiveDate = inclusive_date;
  if (!readingInclusiveDate && connection.inclusive_date) {
    // Auto-use the calculated inclusive_date from the water connection
    readingInclusiveDate = connection.inclusive_date;
    console.log(`📅 Using auto-calculated inclusive_date from connection: Start: ${readingInclusiveDate.start}, End: ${readingInclusiveDate.end}`);
  }

  if (!readingInclusiveDate || !readingInclusiveDate.start || !readingInclusiveDate.end) {
    throw new BadRequestError('Inclusive start and end dates must be set. Please complete meter installation first or provide dates.');
  }

  // 🔹 Determine current billing month
  const today = new Date();
  const billing_month = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;

  // Find the last reading for this connection **for the current month**
  const currentMonthReading = await MeterReading.findOne({
    connection_id,
    billing_month
  }).sort({ created_at: -1 });

  // 🔹 If no reading exists for current month, get the latest reading from ANY previous month
  // This ensures reading continuity (previous month's present becomes this month's previous)
  let previous_reading = 0;

  if (currentMonthReading) {
    // If current month already has a reading, use its present_reading as previous
    previous_reading = currentMonthReading.present_reading;
  } else {
    // No reading for current month yet - get the most recent reading from any month
    const lastReadingAnyMonth = await MeterReading.findOne({
      connection_id
    }).sort({ created_at: -1 });

    // Use the present_reading from the most recent month (even if billed)
    previous_reading = lastReadingAnyMonth ? lastReadingAnyMonth.present_reading : 0;
  }

  // Validate present >= previous (only for can_read status)
  if (can_read_status === 'can_read' && present_reading < previous_reading) {
    throw new BadRequestError('Present reading cannot be less than previous reading');
  }

  // Create meter reading
  const reading = await MeterReading.create({
    connection_id,
    inclusive_date: readingInclusiveDate,
    previous_reading,
    present_reading,
    calculated: present_reading - previous_reading,
    remarks: remarks || "Normal Reading",
    can_read_status: can_read_status || 'can_read',
    recorded_by: user.userId,
    billing_month // 🔹 save the billing month
  });

  res.status(StatusCodes.CREATED).json({
    message: 'Meter reading successfully recorded',
    data: reading
  });
};

const submitReading = async (req, res) => {
  const user = req.user;

  // Only meter readers can submit readings
  if (user.role !== "meter_reader") {
    throw new UnauthorizedError("Only meter readers can submit readings.");
  }

  // Get meter reader's assigned zone
  const personnel = await Personnel.findOne({ user_id: user.userId }).select("assigned_zone");
  if (!personnel || !personnel.assigned_zone) {
    throw new BadRequestError("Meter reader has no assigned zone.");
  }
  const assignedZone = personnel.assigned_zone;

  // Get the current billing month
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;

  // Find all connections in this zone that can have readings recorded
  // Include connections pending disconnection (can still submit readings before disconnection is finalized)
  // Filter by water connection zone (not resident's home zone)
  // Resident zone is for incident reporting; water connection zone is for meter coverage
  const zoneConnections = await WaterConnection.find({
    connection_status: {
      $in: ["active", "for_disconnection", "request_for_disconnection", "scheduled_for_disconnection"]
    },
    zone: assignedZone
  });

  // Filter to only include connections scheduled for THIS MONTH or earlier
  // Exclude connections scheduled for future months (next_period_dates in the future)

  const connectionsScheduledThisMonth = zoneConnections.filter(conn => {
    // Get the reading period (inclusive_date or next_period_dates)
    const readingPeriod = conn.inclusive_date;
    if (!readingPeriod || !readingPeriod.start) {
      return true; // Include if no schedule is set (default to this month)
    }

    const periodStartDate = new Date(readingPeriod.start);
    periodStartDate.setHours(0, 0, 0, 0);

    // Include connection only if reading period starts this month or earlier (not in future)
    return periodStartDate <= today;
  });

  // Find readings that are in progress for the current billing month
  const readingsInZone = await MeterReading.find({
    connection_id: { $in: connectionsScheduledThisMonth.map((c) => c._id) },
    reading_status: "inprogress",
    billing_month: currentMonth, // ✅ only for current month
  });

  // Ensure all connections scheduled for this month have readings
  if (readingsInZone.length !== connectionsScheduledThisMonth.length) {
    return res.status(400).json({
      message: `Cannot submit readings. Some residents in zone ${assignedZone} do not have readings recorded for ${currentMonth}.`,
      missing: connectionsScheduledThisMonth.length - readingsInZone.length,
    });
  }

  // Update all readings in this zone for the current month to "submitted"
  await MeterReading.updateMany(
    { _id: { $in: readingsInZone.map((r) => r._id) } },
    { $set: { reading_status: "submitted" } }
  );

  res.status(200).json({
    message: `All readings for zone ${assignedZone} in ${currentMonth} have been submitted for approval.`,
    total_submitted: readingsInZone.length,
  });
};

const approveReading = async (req, res) => {
  const user = req.user;

  // Only treasurer can approve readings
  if (user.role !== "treasurer") {
    return res.status(403).json({ msg: "Unauthorized. Only treasurer can approve readings." });
  }

  // Get the current billing month
  const today = new Date();
  const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;

  // Get all readings submitted for approval this month
  const readingsToApprove = await MeterReading.find({
    reading_status: "submitted",
    billing_month: currentMonth, // ✅ only approve current month
  });

  if (readingsToApprove.length === 0) {
    return res.status(400).json({ msg: `No submitted readings found for ${currentMonth}.` });
  }

  // Bulk update all submitted readings for the current month
  const result = await MeterReading.updateMany(
    { reading_status: "submitted", billing_month: currentMonth },
    { $set: { reading_status: "approved" } }
  );

  res.status(200).json({
    msg: `All submitted readings for ${currentMonth} have been approved successfully.`,
    total_approved: result.modifiedCount,
  });
};


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
    
    // 🔹 Determine current billing month
    const today = new Date();
    const currentBillingMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;

  const readings = await WaterConnection.aggregate([
              // 1️⃣ Filter connections that are active or pending disconnection (allow meter readers to still see them)
              // Exclude only fully disconnected, for_reconnection, or scheduled connections
              { $match: {
                connection_status: {
                  $in: ["active", "for_disconnection", "request_for_disconnection", "scheduled_for_disconnection"]
                }
              } },

              // 2️⃣ Attach resident info
              {  
                $lookup: {
                  from: "residents",
                  localField: "resident_id",
                  foreignField: "_id",
                  as: "resident"
                }
              },
              { $unwind: { path: "$resident", preserveNullAndEmptyArrays: true } },

              // 3️⃣ Filter by meter reader zone (if applicable)
              // NOTE: We filter by water connection zone, not resident zone
              // Resident zone is for incident reporting, water connection zone is for meter coverage
              ...(Object.keys(zoneFilter).length > 0
                ? [{ $match: { "zone": zoneFilter.zone } }]
                : []),

              // 4️⃣ Latest reading lookup for CURRENT BILLING MONTH
              {
                $lookup: {
                  from: "meterreadings",
                  let: { connId: "$_id" },
                  pipeline: [
                    { $match: {
                      $expr: {
                        $and: [
                          { $eq: ["$connection_id", "$$connId"] },
                          { $eq: ["$billing_month", currentBillingMonth] }
                        ]
                      }
                    }},
                    { $sort: { created_at: -1 } },
                    { $limit: 1 }
                  ],
                  as: "latestReading"
                }
              },
              { $unwind: { path: "$latestReading", preserveNullAndEmptyArrays: true } },

              // 5️⃣ Billing lookups to check if reading has been billed
              {
                $lookup: {
                  from: "Billing",
                  let: { readingId: "$latestReading._id" },
                  pipeline: [
                    { $match: { $expr: { $eq: [{ $toString: "$reading_id" }, { $toString: "$$readingId" }] } } },
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
                    { $match: { $expr: { $eq: [{ $toString: "$reading_id" }, { $toString: "$$readingId" }] } } },
                    { $limit: 1 }
                  ],
                  as: "billingB"
                }
              },

              // 6️⃣ Flag if current month's reading has been billed
              {
                $addFields: {
                  is_billed: {
                    $gt: [{ $add: [{ $size: "$billingA" }, { $size: "$billingB" }] }, 0]
                  }
                }
              }
            ]);




    // 5️⃣ Format the response to make it frontend-friendly
    const connectionDetails = readings.map(item => {
      const reading = item.latestReading;
      const resident = item.resident;



      // 📅 Check if reading exists for current billing month
      // Since we're now filtering by billing_month in the lookup,
      // if a reading exists, it means it's for the current month
      const read_this_month = !!reading;

      return {
        reading_id: reading?._id ? reading._id.toString() : null,
        connection_status: item.connection_status,
        connection_id: item._id ? item._id.toString() : null,
        connection_type: item.type || "Unknown",
        specific_address: item.specific_address || 'null',
        // 📅 Always use reading's inclusive_date if available (current reading period)
        // If no reading exists, use connection's inclusive_date (next period waiting to be read)
        inclusive_date: reading?.inclusive_date || item.inclusive_date || null,
        // 📅 For "Previous Period" display: Show connection's inclusive_date when reading is billed (the next period to read)
        // Otherwise show the reading's inclusive_date
        next_period_dates: item.is_billed ? item.inclusive_date : null,
        full_name: resident ? `${resident.first_name} ${resident.last_name}` : "Unknown",
        // Use water connection zone and purok (not resident's home location)
        // Resident zone is for incident reporting; water connection zone is for meter coverage
        purok_no: item.purok || "N/A",
        zone: item.zone || null,
        previous_reading: reading?.previous_reading ?? 0,
        present_reading: reading?.present_reading ?? 0,
        calculated: reading?.calculated ?? 0,
        meter_number: item.meter_no,
        reading_status: reading?.reading_status,
        can_read_status: reading?.can_read_status || 'can_read',
        remarks: reading?.remarks || "Normal Reading",
        is_billed: !!item.is_billed,
        read_this_month: read_this_month,
        last_read_date: reading?.created_at || null
      };
    });

    console.log('📊 Total raw results from aggregation:', readings.length);
    console.log('📊 First 3 aggregation results:', readings.slice(0, 3).map(r => ({
      connection_id: r._id,
      resident_name: r.resident ? `${r.resident.first_name} ${r.resident.last_name}` : 'Unknown',
      connection_zone: r.zone,
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

const updateReadings = async (req, res, next) => {
  try {
    const { reading_id } = req.params;
    const { present_reading, inclusive_date, remarks, can_read_status } = req.body;
    const user = req.user;

    console.log('🔄 updateReadings called with:', {
      reading_id,
      present_reading,
      inclusive_date,
      remarks,
      can_read_status,
      user_role: user?.role
    });

    // ✅ Validate input - ensure reading_id is valid MongoDB ObjectId
    if (!reading_id) throw new BadRequestError('Reading ID is required.');
    if (!require('mongoose').Types.ObjectId.isValid(reading_id)) {
      throw new BadRequestError('Invalid Reading ID format.');
    }
    if (present_reading === undefined && !inclusive_date && !remarks && !can_read_status) {
      throw new BadRequestError('At least one field (present_reading, inclusive_date, remarks, can_read_status) is required.');
    }

    // ✅ Fetch the reading
    const reading = await MeterReading.findById(reading_id).populate('connection_id');

    if (!reading) {
      console.error('Reading not found:', reading_id);
      throw new BadRequestError('Reading not found.');
    }

    console.log('📖 Reading fetched:', {
      reading_id: reading._id,
      reading_status: reading.reading_status,
      connection_zone: reading.connection_id?.zone
    });

    // ✅ Check status
    if (reading.reading_status === 'approved') {
      throw new BadRequestError('Cannot update reading. Reading has already been approved.');
    }

    // ✅ Check if meter reader is allowed to update this reading (zone match)
    const personnel = await Personnel.findOne({ user_id: user.userId }).select('assigned_zone');
    if (!personnel || !personnel.assigned_zone) {
      console.error('❌ Personnel not found or no zone assigned:', user.userId);
      throw new BadRequestError('Meter reader has no assigned zone.');
    }

    console.log('👤 Personnel found:', {
      personnel_id: personnel._id,
      assigned_zone: personnel.assigned_zone
    });

    // Check water connection zone (not resident's home zone)
    // Resident zone is for incident reporting; water connection zone is for meter coverage
    const connectionZone = reading.connection_id?.zone;
    if (!connectionZone) {
      console.error('❌ Connection zone not found');
      throw new BadRequestError('Connection zone information is missing.');
    }

    if (connectionZone !== personnel.assigned_zone) {
      console.error('❌ Zone mismatch:', { connectionZone, assignedZone: personnel.assigned_zone });
      throw new UnauthorizedError(`You can only update readings in your assigned zone (${personnel.assigned_zone}). This connection is in zone ${connectionZone}.`);
    }

    // ✅ Validate remarks if switching to cannot_read
    if (can_read_status === 'cannot_read' && !remarks) {
      throw new BadRequestError('Please provide remarks explaining why the meter cannot be read');
    }

    // ✅ If present_reading is being updated (and not cannot_read), ensure it's >= previous_reading
    if (present_reading !== undefined && can_read_status !== 'cannot_read' && present_reading < reading.previous_reading) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'Present reading cannot be less than previous reading.'
      });
    }

    // ✅ Update fields
    if (present_reading !== undefined) reading.present_reading = present_reading;
    if (inclusive_date && inclusive_date.start && inclusive_date.end) {
      reading.inclusive_date = {
        start: new Date(inclusive_date.start),
        end: new Date(inclusive_date.end)
      };
    }
    if (remarks && remarks.trim()) reading.remarks = remarks;
    if (can_read_status) reading.can_read_status = can_read_status;

    await reading.save(); // pre-save hook recalculates "calculated"

    res.status(StatusCodes.OK).json({
      message: 'Reading updated successfully.',
      data: reading
    });
  } catch (error) {
    next(error);
  }
};


/**
 * ✅ Get Submitted Readings (for treasurer approval page)
 * GET /api/v1/meter-reader/submitted-readings
 * Returns only readings with status 'submitted'
 */
const getSubmittedReadings = async (req, res) => {
  try {
    const user = req.user;

    // Only treasurer can access
    if (user.role !== 'treasurer') {
      return res.status(403).json({ 
        message: 'Unauthorized. Only treasurer can view submitted readings.' 
      });
    }

    const readings = await WaterConnection.aggregate([
      // 1️⃣ Filter connections that can have submitted readings (active or pending disconnection)
      { $match: {
        connection_status: {
          $in: ["active", "for_disconnection", "request_for_disconnection", "scheduled_for_disconnection"]
        }
      } },

      // 2️⃣ Attach resident info
      {
        $lookup: {
          from: "residents",
          localField: "resident_id",
          foreignField: "_id",
          as: "resident"
        }
      },
      { $unwind: { path: "$resident", preserveNullAndEmptyArrays: true } },

      // 3️⃣ Latest reading lookup
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

      // 4️⃣ Filter only submitted readings
      { $match: { "latestReading.reading_status": "submitted" } }
    ]);

    // Format the response
    const submittedReadings = readings.map(item => {
      const reading = item.latestReading;
      const resident = item.resident;

      return {
        reading_id: reading?._id ? reading._id.toString() : null,
        connection_id: item._id ? item._id.toString() : null,
        connection_status: item.connection_status,
        connection_type: item.type || "Unknown",
        inclusive_date: reading?.inclusive_date || null,
        full_name: resident ? `${resident.first_name} ${resident.last_name}` : "Unknown",
        purok_no: resident?.purok || "N/A",
        zone: resident?.zone || null,
        previous_reading: reading?.previous_reading ?? 0,
        present_reading: reading?.present_reading ?? 0,
        calculated: reading?.calculated ?? 0,
        reading_status: reading?.reading_status,
        remarks: reading?.remarks || "Normal Reading",
        recorded_by: reading?.recorded_by || null,
        created_at: reading?.created_at || null
      };
    });

    return res.status(StatusCodes.OK).json({
      message: "Submitted readings fetched successfully",
      connection_details: submittedReadings,
      total: submittedReadings.length
    });

  } catch (error) {
    console.error('🔥 getSubmittedReadings error:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Failed to fetch submitted readings",
      error: error.message
    });
  }
};

/**
 * ✅ Get Approval Statistics
 * GET /api/v1/meter-reader/approval-stats
 * Returns statistics for treasurer dashboard
 */
const getApprovalStats = async (req, res) => {
  try {
    const user = req.user;

    if (user.role !== 'treasurer') {
      return res.status(403).json({ 
        message: 'Unauthorized. Only treasurer can view stats.' 
      });
    }

    // Count readings by status
    const stats = await MeterReading.aggregate([
      {
        $group: {
          _id: "$reading_status",
          count: { $sum: 1 }
        }
      }
    ]);

    // Get readings approved today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const approvedToday = await MeterReading.countDocuments({
      reading_status: 'approved',
      updated_at: { $gte: today }
    });

    // Format stats
    const formattedStats = {
      inprogress: stats.find(s => s._id === 'inprogress')?.count || 0,
      submitted: stats.find(s => s._id === 'submitted')?.count || 0,
      approved: stats.find(s => s._id === 'approved')?.count || 0,
      approved_today: approvedToday
    };

    res.status(200).json({
      message: 'Statistics fetched successfully',
      stats: formattedStats
    });

  } catch (error) {
    console.error('🔥 getApprovalStats error:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Failed to fetch statistics",
      error: error.message
    });
  }
};







/**
 * ✅ Get Reading History (for admin dashboard)
 * GET /api/v1/meter-reader/reading-history
 * Returns all meter readings (not just latest) organized by zone
 */
const getReadingHistory = async (req, res) => {
  try {
    const readings = await WaterConnection.aggregate([
      // 1️⃣ Filter only active connections
      { $match: { connection_status: "active" } },

      // 2️⃣ Attach resident info
      {
        $lookup: {
          from: "residents",
          localField: "resident_id",
          foreignField: "_id",
          as: "resident"
        }
      },
      { $unwind: { path: "$resident", preserveNullAndEmptyArrays: true } },

      // 3️⃣ Get ALL readings (not just latest)
      {
        $lookup: {
          from: "meterreadings",
          let: { connId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$connection_id", "$$connId"] } } },
            { $sort: { created_at: -1 } } // Sort by newest first
          ],
          as: "readings"
        }
      },

      // 4️⃣ Unwind the readings array to get one row per reading
      { $unwind: { path: "$readings", preserveNullAndEmptyArrays: true } },

      // 5️⃣ Skip connections without readings
      { $match: { "readings._id": { $exists: true } } }
    ]);

    // Format the response
    const readingHistory = readings.map(item => {
      const reading = item.readings;
      const resident = item.resident;

      return {
        reading_id: reading?._id ? reading._id.toString() : null,
        connection_id: item._id ? item._id.toString() : null,
        meter_number: item.meter_no,
        full_name: resident ? `${resident.first_name} ${resident.last_name}` : "Unknown",
        zone: item.zone || null,
        purok_no: item.purok || "N/A",
        previous_reading: reading?.previous_reading ?? 0,
        present_reading: reading?.present_reading ?? 0,
        calculated: reading?.calculated ?? 0,
        inclusive_date: reading?.inclusive_date || null,
        reading_status: reading?.reading_status,
        can_read_status: reading?.can_read_status || 'can_read',
        remarks: reading?.remarks || "Normal Reading",
        recorded_by: reading?.recorded_by || null,
        created_at: reading?.created_at || null
      };
    });

    return res.status(StatusCodes.OK).json({
      message: "Reading history fetched successfully",
      data: readingHistory,
      total: readingHistory.length
    });

  } catch (error) {
    console.error('🔥 getReadingHistory error:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Failed to fetch reading history",
      error: error.message
    });
  }
};

// 🔧 Admin endpoint to manually update inclusive_date for a water connection
const updateInclusiveDate = async (req, res) => {
  try {
    const { connection_id, start_date, end_date } = req.body;
    const user = req.user;

    // Allow admin and meter_reader (for testing purposes)
    if (!['admin', 'meter_reader'].includes(user.role)) {
      throw new UnauthorizedError('Only admins and meter readers can update inclusive dates');
    }

    // Validate input
    if (!connection_id || !start_date || !end_date) {
      throw new BadRequestError('connection_id, start_date, and end_date are required');
    }

    // Find and update the connection
    const connection = await WaterConnection.findById(connection_id);
    if (!connection) {
      throw new BadRequestError('Water connection not found');
    }

    const newStartDate = new Date(start_date);
    const newEndDate = new Date(end_date);

    // Validate dates
    if (newStartDate >= newEndDate) {
      throw new BadRequestError('Start date must be before end date');
    }

    // Update inclusive_date
    connection.inclusive_date = {
      start: newStartDate,
      end: newEndDate
    };

    await connection.save();

    console.log(`📅 ${user.role === 'admin' ? 'Admin' : 'Meter Reader'} updated inclusive_date for connection ${connection_id}`);
    console.log(`   Old dates: ${connection.inclusive_date ? `${connection.inclusive_date.start.toISOString().split('T')[0]} to ${connection.inclusive_date.end.toISOString().split('T')[0]}` : 'None'}`);
    console.log(`   New dates: ${newStartDate.toISOString().split('T')[0]} to ${newEndDate.toISOString().split('T')[0]}`);

    return res.status(StatusCodes.OK).json({
      success: true,
      message: 'Inclusive date updated successfully',
      data: {
        connection_id: connection._id,
        inclusive_date: {
          start: newStartDate.toISOString().split('T')[0],
          end: newEndDate.toISOString().split('T')[0]
        }
      }
    });
  } catch (error) {
    console.error('🔥 updateInclusiveDate error:', error);
    return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Failed to update inclusive date",
      error: error.message
    });
  }
};

// 🔧 Admin endpoint to sync WaterConnection inclusive_date from latest reading
const syncInclusiveDates = async (req, res) => {
  try {
    const user = req.user;

    // Validate admin role
    if (user.role !== 'admin') {
      throw new UnauthorizedError('Only admins can sync inclusive dates');
    }

    // Get all connections with readings
    const connections = await WaterConnection.find({
      inclusive_date: { $exists: true, $ne: null }
    });

    let syncCount = 0;
    const results = [];

    for (const connection of connections) {
      // Find latest reading for this connection
      const latestReading = await MeterReading.findOne({
        connection_id: connection._id
      }).sort({ created_at: -1 });

      if (latestReading && latestReading.inclusive_date) {
        const connectionStartStr = connection.inclusive_date.start ? new Date(connection.inclusive_date.start).toISOString().split('T')[0] : 'null';
        const connectionEndStr = connection.inclusive_date.end ? new Date(connection.inclusive_date.end).toISOString().split('T')[0] : 'null';
        const readingStartStr = new Date(latestReading.inclusive_date.start).toISOString().split('T')[0];
        const readingEndStr = new Date(latestReading.inclusive_date.end).toISOString().split('T')[0];

        // Check if dates are different
        if (connectionStartStr !== readingStartStr || connectionEndStr !== readingEndStr) {
          console.log(`🔄 Syncing connection ${connection._id}`);
          console.log(`   Old: ${connectionStartStr} to ${connectionEndStr}`);
          console.log(`   New: ${readingStartStr} to ${readingEndStr}`);

          connection.inclusive_date = {
            start: latestReading.inclusive_date.start,
            end: latestReading.inclusive_date.end
          };
          await connection.save();
          syncCount++;

          results.push({
            connection_id: connection._id,
            old_dates: {
              start: connectionStartStr,
              end: connectionEndStr
            },
            new_dates: {
              start: readingStartStr,
              end: readingEndStr
            }
          });
        }
      }
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      message: `Synced ${syncCount} water connections with their latest reading dates`,
      synced_count: syncCount,
      details: results
    });
  } catch (error) {
    console.error('🔥 syncInclusiveDates error:', error);
    return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Failed to sync inclusive dates",
      error: error.message
    });
  }
};

module.exports = { getAllConnectionIDs, inputReading, getLatestReadings, submitReading, updateReadings, approveReading,
                    getSubmittedReadings, getApprovalStats, getReadingHistory, updateInclusiveDate, syncInclusiveDates
};
