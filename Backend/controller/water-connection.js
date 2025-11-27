const WaterConnection = require("../model/WaterConnection");
const Resident = require("../model/Resident");
const Reading = require("../model/Meter-reading");
const ScheduleTask = require("../model/Schedule-task");
const Assignment = require("../model/Assignment");
const Personnel = require("../model/Personnel");
const { StatusCodes } = require('http-status-codes');

const nodemailer = require("nodemailer")
const crypto = require('crypto'); // <-- add this at the top

// Fetch all active water connections with resident + last reading
const getLatestConnections = async (req, res) => {
  try {
    // Only fetch active connections
    const connections = await WaterConnection.find({ connection_status: "pending" })
      .populate("resident_id"); // get resident details


    // Map each connection with extra details
    const connectionDetails = await Promise.all(
      connections.map(async (conn) => {
        const lastReading = await Reading.findOne({ connection_id: conn._id })
          .sort({ createdAt: -1 }); // latest reading

        return {
          connection_id: conn._id,
          full_name: conn.resident_id
            ? `${conn.resident_id.first_name} ${conn.resident_id.last_name}`
            : "Unknown",
          purok_no: conn.resident_id?.purok || "N/A", // from Resident
          meter_no: conn.meter_no,
          connection_status: conn.connection_status,
          type: conn.type,
          previous_reading: lastReading ? lastReading.present_reading : 0,
        };
      })
    );

    res.status(200).json({
      message: "Connections fetched successfully",
      connection_details: connectionDetails,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ✅ Get all ACTIVE water connections
const getAllWaterConnections = async (req, res) => {
  const user = req.user;

  try {
    let filter = {};

    // ✅ If resident is logged in, return only their connection
    if (user.role === 'resident') {
      const resident = await Resident.findOne({ user_id: user.userId });

      if (!resident) {
        return res.status(404).json({
          success: false,
          message: "Resident profile not found for this user",
          data: [],
        });
      }

      const connection = await WaterConnection.findOne({ resident_id: resident._id });

      if (!connection) {
        return res.status(404).json({
          success: false,
          message: "No water connection found for this resident",
          data: [],
        });
      }

      filter = { _id: connection._id }; // show only that specific connection
    }

    // ✅ Fetch the water connections based on filter
    const connections = await WaterConnection.find(filter).populate("resident_id");

    // ✅ Attach latest reading data
    const data = await Promise.all(
      connections.map(async (conn) => {
        const lastReading = await Reading.findOne({ connection_id: conn._id })
          .sort({ createdAt: -1 });

        const r = conn.resident_id; // shorter reference

        return {
          connection_id: conn._id,
          resident_id: conn.resident_id?._id,  // Add resident_id for multi-meter functionality
          full_name: r ? `${r.first_name} ${r.last_name}` : "Unknown",
          address: r ? `Biking ${r.zone}, Purok ${r.purok}` : "No address available",
          meter_no: conn.meter_no,
          connection_status: conn.connection_status,
          type: conn.type,
          contact_no: r?.contact_no || "N/A",
          email: r?.email || "N/A",
          status: r?.status || "N/A",
          previous_reading: lastReading?.previous_reading ?? 0,
          present_reading: lastReading?.present_reading ?? 0,

          //disconnection
          disconnection_type: conn.disconnection_type,
          disconnection_requested_date: conn.disconnection_requested_date,

          //archive
          archive_status: conn.archive_status,
          archive_reason: conn.archive_reason,
          archive_requested_date: conn.archive_requested_date,
          // payload for the user information
          first_name: r?.first_name,
          last_name: r?.last_name,
          purok: r?.purok,
          zone: r?.zone
        };
      })
    );

    res.status(200).json({
      success: true,
      message: "Water connections fetched successfully",
      data,
      count: data.length
    });
    
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};




// ✅ Get all ACTIVE water connections
const getActiveWaterConnections = async (req, res) => {
  try {
    const connections = await WaterConnection.find({ connection_status: "active" })
      .populate("resident_id");

    const data = await Promise.all(
      connections.map(async (conn) => {
        const lastReading = await Reading.findOne({ connection_id: conn._id })
          .sort({ createdAt: -1 });

        return {
          connection_id: conn._id,
          full_name: conn.resident_id
            ? `${conn.resident_id.first_name} ${conn.resident_id.last_name}`
            : "Unknown",
          address: conn.resident_id
            ? `Biking ${conn.resident_id.zone}, Purok ${conn.resident_id.purok}`
            : "No address available",
          meter_no: conn.meter_no,
          connection_status: conn.connection_status,
          type: conn.type,
          contact_no: conn.resident_id?.contact_no || "N/A",
          email: conn.resident_id?.email || "N/A",
          status: conn.resident_id?.status || "N/A",
          previous_reading: lastReading?.previous_reading || 0,
          present_reading: lastReading?.present_reading || 0,
        };
      })
    );

    res.status(200).json({
      success: true,
      message: "Active water connections fetched successfully",
      data,
      count: data.length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// ✅ Get all INACTIVE water connections
const getInactiveWaterConnections = async (req, res) => {
  try {
    const connections = await WaterConnection.find({ connection_status: "inactive" })
      .populate("resident_id");

    const data = await Promise.all(
      connections.map(async (conn) => {
        const lastReading = await Reading.findOne({ connection_id: conn._id })
          .sort({ createdAt: -1 });

        return {
          connection_id: conn._id,
          full_name: conn.resident_id
            ? `${conn.resident_id.first_name} ${conn.resident_id.last_name}`
            : "Unknown",
          address: conn.resident_id
            ? `Biking ${conn.resident_id.zone}, Purok ${conn.resident_id.purok}`
            : "No address available",
          meter_no: conn.meter_no,
          connection_status: conn.connection_status,
          type: conn.type,
          contact_no: conn.resident_id?.contact_no || "N/A",
          email: conn.resident_id?.email || "N/A",
          status: conn.resident_id?.status || "N/A",
          previous_reading: lastReading?.previous_reading || 0,
          present_reading: lastReading?.present_reading || 0,
        };
      })
    );

    res.status(200).json({
      success: true,
      message: "Inactive water connections fetched successfully",
      data,
      count: data.length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};




// Add this controller to your backend (e.g., controllers/residentController.js or authController.js)

const editResidentAccount = async (req, res) => {
  try {
    // ✅ FIXED: Changed from { connection_id } to { id }
    const {connection_id } = req.params; // Get connection ID from URL params
    const updateData = req.body; // Get updated data from request body

    // Find the water connection first
    const waterConnection = await WaterConnection.findById(connection_id)
      .populate("resident_id");

    if (!waterConnection) {
      return res.status(404).json({ 
        message: "Water connection not found" 
      });
    }

    const residentId = waterConnection.resident_id._id;

    // Prepare resident update data
    const residentUpdateData = {};
    if (updateData.first_name) residentUpdateData.first_name = updateData.first_name;
    if (updateData.last_name) residentUpdateData.last_name = updateData.last_name;
    if (updateData.email) residentUpdateData.email = updateData.email;
    if (updateData.contact_no) residentUpdateData.contact_no = updateData.contact_no;
    if (updateData.purok) residentUpdateData.purok = updateData.purok;
    if (updateData.zone) residentUpdateData.zone = updateData.zone;
    if (updateData.status) residentUpdateData.status = updateData.status;

    // Prepare water connection update data
    const connectionUpdateData = {};
    if (updateData.meter_no) connectionUpdateData.meter_no = updateData.meter_no;
    if (updateData.type) connectionUpdateData.type = updateData.type;
    if (updateData.connection_status) connectionUpdateData.connection_status = updateData.connection_status;

    // Update resident information
    const updatedResident = await Resident.findByIdAndUpdate(
      residentId,
      residentUpdateData,
      { new: true, runValidators: true }
    );

    // Update water connection information
    const updatedConnection = await WaterConnection.findByIdAndUpdate(
      connection_id,
      connectionUpdateData,
      { new: true, runValidators: true }
    ).populate("resident_id");

    // Get the latest reading for response
    const lastReading = await Reading.findOne({ connection_id: connection_id })
      .sort({ createdAt: -1 });

    // Return formatted response
    const responseData = {
      connection_id: updatedConnection._id,
      full_name: `${updatedResident.first_name} ${updatedResident.last_name}`,
      address: `Biking ${updatedResident.zone}, Purok ${updatedResident.purok}`,
      meter_no: updatedConnection.meter_no,
      connection_status: updatedConnection.connection_status,
      type: updatedConnection.type,
      contact_no: updatedResident.contact_no,
      email: updatedResident.email,
      status: updatedResident.status,
      previous_reading: lastReading ? lastReading.previous_reading : 0,
      present_reading: lastReading ? lastReading.present_reading : 0,
    };

    res.status(200).json({
      message: "Resident account updated successfully",
      data: responseData,
    });
  } catch (error) {
    console.error("Error updating resident account:", error);
    res.status(500).json({ 
      message: error.message || "Failed to update resident account" 
    });
  }
};


// ✅ Update contact information and handle email verification
const updateUserContact = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Unauthorized: User not logged in" });
    }

    const { email, contact_no, verification_code } = req.body;

    if (!email && !contact_no && !verification_code) {
      return res.status(StatusCodes.BAD_REQUEST).json({ 
        message: "Nothing to update. Please provide email, contact_no, or verification code." 
      });
    }

    // Find resident using user_id reference
    const resident = await Resident.findOne({ user_id: user.userId });
    if (!resident) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: "Resident not found" });
    }

    // ✅ Handle verification code submission
    if (verification_code) {
      if (!resident.email_verification_code || !resident.pending_email) {
        return res.status(StatusCodes.BAD_REQUEST).json({ message: "No pending email verification found." });
      }

      if (resident.email_verification_code !== verification_code) {
        return res.status(StatusCodes.BAD_REQUEST).json({ message: "Invalid verification code." });
      }

      if (resident.email_verification_expires < new Date()) {
        return res.status(StatusCodes.BAD_REQUEST).json({ message: "Verification code has expired." });
      }

      // Update email in DB
      resident.email = resident.pending_email;
      resident.pending_email = null;
      resident.email_verification_code = null;
      resident.email_verification_expires = null;

      await resident.save();

      return res.status(StatusCodes.OK).json({
        message: "Email verified and updated successfully.",
        data: { email: resident.email }
      });
    }

    // ✅ Update contact number immediately
    if (contact_no) resident.contact_no = contact_no;

    // ✅ Handle new email update
    if (email && email !== resident.email) {
      const verificationCode = crypto.randomBytes(3).toString('hex').toUpperCase(); // 6-char code
      resident.pending_email = email;
      resident.email_verification_code = verificationCode;
      resident.email_verification_expires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

      // Send verification email
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

    const mailOptions = {
  from: `"AGASPAY" <${process.env.EMAIL_USER}>`,
  to: email,
  subject: 'Verify Your New Email Address',
  html: `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #f9f9f9;">
        <h2 style="color: #1E40AF; text-align: center;">AGASPAY</h2>
        <p>Hello <strong>${resident.first_name}</strong>,</p>
        <p>You requested to update your email address for your AGASPAY account.</p>
        <p style="text-align: center; margin: 30px 0;">
          <span style="font-size: 20px; font-weight: bold; color: #1E40AF; padding: 10px 20px; border: 1px solid #1E40AF; border-radius: 5px; display: inline-block;">
            ${verificationCode}
          </span>
        </p>
        <p style="text-align: center; color: #555;">This verification code will expire in 15 minutes.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e0e0e0;" />
        <p style="font-size: 12px; color: #888; text-align: center;">
          If you did not request this, please ignore this email.  
          &copy; ${new Date().getFullYear()} AGASPAY
        </p>
      </div>
    </div>
  `
};


      await transporter.sendMail(mailOptions);
    }

    await resident.save();

    res.status(StatusCodes.OK).json({
      message: email ? "Contact info updated. Please verify your new email." : "Contact info updated successfully",
      data: {
        email: resident.email,
        pending_email: resident.pending_email,
        contact_no: resident.contact_no,
        updated_at: new Date()
      }
    });

  } catch (error) {
    console.error("Error updating contact info:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Failed to update contact information" });
  }
};

// ✅ Verify the pending email using verification code
const verifyEmail = async (req, res) => {
  try {
    const user = req.user;
    const { code } = req.body;

    if (!user) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Unauthorized: User not logged in" });
    }

    const resident = await Resident.findOne({ user_id: user.userId });
    if (!resident || !resident.pending_email) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: "No pending email to verify" });
    }

    if (resident.email_verification_code !== code) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: "Invalid verification code" });
    }

    if (new Date() > resident.email_verification_expires) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: "Verification code expired" });
    }

    // Verification successful: update email
    resident.email = resident.pending_email;
    resident.pending_email = null;
    resident.email_verification_code = null;
    resident.email_verification_expires = null;

    await resident.save();

    res.status(StatusCodes.OK).json({ message: "Email verified successfully", email: resident.email });

  } catch (error) {
    console.error("Error verifying email:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Failed to verify email" });
  }
};


// Get connections marked for disconnection
const getConnectionsForDisconnection = async (req, res) => {
  try {
    const user = req.user;

    // Only secretary can access
    if (user.role !== 'secretary' && user.role !== 'admin') {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        msg: 'Unauthorized. Only secretary can access this.',
      });
    }

    // Find all connections marked for disconnection
    const connections = await WaterConnection.find({
      connection_status: 'for_disconnection'
    }).populate('resident_id', 'first_name last_name contact_no purok');

    const connectionData = connections.map(conn => ({
      connection_id: conn._id,
      meter_no: conn.meter_no,
      residentName: conn.resident_id
        ? `${conn.resident_id.first_name} ${conn.resident_id.last_name}`
        : 'Unknown',
      contactNo: conn.resident_id?.contact_no || 'N/A',
      purok: conn.resident_id?.purok || 'N/A',
      connection_status: conn.connection_status,
      resident_id: conn.resident_id?._id
    }));

    res.status(StatusCodes.OK).json({
      msg: 'Connections for disconnection retrieved successfully',
      data: connectionData
    });

  } catch (error) {
    console.error('Error fetching connections for disconnection:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: 'Failed to retrieve connections',
      error: error.message
    });
  }
};

// Get disconnected connections for reconnection
const getDisconnectedConnections = async (req, res) => {
  try {
    const user = req.user;

    // Only secretary can access
    if (user.role !== 'secretary' && user.role !== 'admin') {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        msg: 'Unauthorized. Only secretary can access this.',
      });
    }

    // Find all disconnected connections
    const connections = await WaterConnection.find({
      connection_status: 'disconnected'
    }).populate('resident_id', 'first_name last_name contact_no purok');

    const connectionData = connections.map(conn => ({
      connection_id: conn._id,
      meter_no: conn.meter_no,
      residentName: conn.resident_id
        ? `${conn.resident_id.first_name} ${conn.resident_id.last_name}`
        : 'Unknown',
      contactNo: conn.resident_id?.contact_no || 'N/A',
      purok: conn.resident_id?.purok || 'N/A',
      connection_status: conn.connection_status,
      resident_id: conn.resident_id?._id
    }));

    res.status(StatusCodes.OK).json({
      msg: 'Disconnected connections retrieved successfully',
      data: connectionData
    });

  } catch (error) {
    console.error('Error fetching disconnected connections:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: 'Failed to retrieve connections',
      error: error.message
    });
  }
};

// Get connections marked for reconnection
const getConnectionsForReconnection = async (req, res) => {
  try {
    const user = req.user;

    // Only secretary can access
    if (user.role !== 'secretary' && user.role !== 'admin') {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        msg: 'Unauthorized. Only secretary can access this.',
      });
    }

    // Find all connections marked for reconnection
    const connections = await WaterConnection.find({
      connection_status: 'for_reconnection'
    }).populate('resident_id', 'first_name last_name contact_no purok');

    const connectionData = connections.map(conn => ({
      connection_id: conn._id,
      meter_no: conn.meter_no,
      residentName: conn.resident_id
        ? `${conn.resident_id.first_name} ${conn.resident_id.last_name}`
        : 'Unknown',
      contactNo: conn.resident_id?.contact_no || 'N/A',
      purok: conn.resident_id?.purok || 'N/A',
      connection_status: conn.connection_status,
      resident_id: conn.resident_id?._id
    }));

    res.status(StatusCodes.OK).json({
      msg: 'Connections for reconnection retrieved successfully',
      data: connectionData
    });

  } catch (error) {
    console.error('Error fetching connections for reconnection:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: 'Failed to retrieve connections',
      error: error.message
    });
  }
};

/**
 * Get all water connections (meters) for a specific resident
 * GET /api/v1/water-connections/resident-meters
 */
const getResidentMeters = async (req, res) => {
  try {
    const userId = req.user.userId; // Get logged-in user ID

    // Find the resident by user_id
    const resident = await Resident.findOne({ user_id: userId });

    if (!resident) {
      return res.status(StatusCodes.NOT_FOUND).json({
        msg: 'Resident not found'
      });
    }

    // Get all water connections for this resident
    const connections = await WaterConnection.find({ resident_id: resident._id })
      .sort({ created_at: -1 });

    const connectionsData = connections.map(conn => ({
      connection_id: conn._id,
      meter_no: conn.meter_no,
      zone: conn.zone,
      purok: conn.purok,
      connection_status: conn.connection_status,
      type: conn.type,
      created_at: conn.created_at
    }));

    return res.status(StatusCodes.OK).json({
      msg: 'Resident meters fetched successfully',
      data: connectionsData,
      total: connectionsData.length
    });

  } catch (error) {
    console.error('Error fetching resident meters:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: 'Failed to retrieve resident meters',
      error: error.message
    });
  }
};

/**
 * Add a new meter to an existing resident (Secretary only)
 * POST /api/v1/water-connections/add-meter
 */
const addMeterToResident = async (req, res) => {
  try {
    const { resident_id, meter_no, zone, purok, type } = req.body;

    // Validate required fields
    if (!resident_id || !meter_no || !zone || !purok || !type) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        msg: 'Please provide all required fields: resident_id, meter_no, zone, purok, type'
      });
    }

    // Check if resident exists
    const resident = await Resident.findById(resident_id);
    if (!resident) {
      return res.status(StatusCodes.NOT_FOUND).json({
        msg: 'Resident not found'
      });
    }

    // Check if meter number already exists
    const existingMeter = await WaterConnection.findOne({ meter_no });
    if (existingMeter) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        msg: 'This meter number is already registered'
      });
    }

    // Validate zone-purok mapping
    const validPuroks = {
      '1': ['4', '5', '6'],
      '2': ['1', '2', '3'],
      '3': ['7']
    };

    if (!validPuroks[zone].includes(purok)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        msg: `Invalid purok for zone ${zone}. Zone ${zone} only allows puroks: ${validPuroks[zone].join(', ')}`
      });
    }

    // Create new water connection
    const newConnection = await WaterConnection.create({
      resident_id,
      meter_no,
      zone,
      purok,
      type,
      connection_status: 'pending'
    });

    // --- AUTO-SCHEDULE METER INSTALLATION TASK (Same flow as register.js) ---
    let scheduleWarning = null;
    let schedulingDetails = null;

    try {
      // Find all maintenance personnel (exclude archived)
      const maintenancePersonnel = await Personnel.find({
        role: 'maintenance',
        $or: [
          { archive_status: null },
          { archive_status: { $ne: 'archived' } }
        ]
      });

      if (maintenancePersonnel.length === 0) {
        scheduleWarning = 'No maintenance personnel available. Please schedule the meter installation manually.';
      } else {
        // Define available time slots (same as register.js)
        const timeSlots = ['09:30', '10:30', '13:30', '14:30'];

        // Calculate next business day (tomorrow) using Philippine Time (UTC+8)
        const now = new Date();
        const philippineTime = new Date(now.getTime() + (8 * 60 * 60 * 1000));
        const tomorrow = new Date(philippineTime);
        tomorrow.setUTCDate(philippineTime.getUTCDate() + 1);
        tomorrow.setUTCHours(0, 0, 0, 0);

        const scheduleDate = tomorrow.toISOString().split('T')[0]; // YYYY-MM-DD
        console.log(`[AddMeter] 🇵🇭 Philippine Time: ${philippineTime.toISOString()}`);
        console.log(`[AddMeter] 📅 Schedule date: ${scheduleDate}`);

        let scheduleTime = null;
        let selectedPersonnel = null;

        // Try to find an available personnel for each time slot
        for (const slot of timeSlots) {
          // Find maintenance personnel who are AVAILABLE (not already assigned) at this date and time
          const availablePersonnel = [];
          const targetDate = new Date(scheduleDate);
          targetDate.setHours(0, 0, 0, 0);

          for (const personnel of maintenancePersonnel) {
            // Check if this personnel has any existing assignment at this exact date and time
            const existingAssignment = await ScheduleTask.findOne({
              assigned_personnel: personnel._id,
              schedule_time: slot
            });

            // If assignment exists, check if it's for the same date
            let isBusy = false;
            if (existingAssignment && existingAssignment.schedule_date) {
              const existingDate = new Date(existingAssignment.schedule_date);

              // Compare dates (year, month, day only)
              if (existingDate.getFullYear() === targetDate.getFullYear() &&
                  existingDate.getMonth() === targetDate.getMonth() &&
                  existingDate.getDate() === targetDate.getDate()) {
                isBusy = true;
              }
            }

            // Only include personnel who have NO assignments at this time (conflict-free)
            if (!isBusy) {
              availablePersonnel.push(personnel);
            }
          }

          console.log(`[AddMeter] Time slot ${slot}: ${availablePersonnel.length}/${maintenancePersonnel.length} personnel available`);

          // If ALL personnel are available for this time slot, use it (best option - no conflicts)
          if (availablePersonnel.length === maintenancePersonnel.length) {
            // Load balancing: Get task counts for all available personnel
            const personnelWithCounts = await Promise.all(
              availablePersonnel.map(async (personnel) => ({
                personnel,
                taskCount: await ScheduleTask.countDocuments({ assigned_personnel: personnel._id })
              }))
            );

            // Find the minimum task count
            const minTaskCount = Math.min(...personnelWithCounts.map(p => p.taskCount));

            // Get all personnel with the minimum task count (could be multiple)
            const leastBusyPersonnel = personnelWithCounts.filter(p => p.taskCount === minTaskCount);

            // If multiple personnel have the same minimum task count, pick first one
            selectedPersonnel = leastBusyPersonnel[0].personnel;
            console.log(`[AddMeter] ✅ Using time slot ${slot} - assigned to ${selectedPersonnel.first_name} ${selectedPersonnel.last_name} (${minTaskCount} existing tasks)`);

            scheduleTime = slot;
            break;
          }

          // If SOME personnel are available, remember this slot as a fallback
          if (availablePersonnel.length > 0 && !selectedPersonnel) {
            // Load balancing: Get task counts for all available personnel
            const personnelWithCounts = await Promise.all(
              availablePersonnel.map(async (personnel) => ({
                personnel,
                taskCount: await ScheduleTask.countDocuments({ assigned_personnel: personnel._id })
              }))
            );

            // Find the minimum task count
            const minTaskCount = Math.min(...personnelWithCounts.map(p => p.taskCount));

            // Get all personnel with the minimum task count (could be multiple)
            const leastBusyPersonnel = personnelWithCounts.filter(p => p.taskCount === minTaskCount);

            // Select first one
            selectedPersonnel = leastBusyPersonnel[0].personnel;
            console.log(`[AddMeter] ⚠️  Partial availability at ${slot} - assigned to ${selectedPersonnel.first_name} ${selectedPersonnel.last_name} (${minTaskCount} tasks), continuing to check for better slots...`);

            scheduleTime = slot;
            // Don't break - keep checking for a time slot where ALL personnel are free
          }
        }

        // Check if we found an available slot
        if (!selectedPersonnel) {
          // All personnel are busy at all time slots - warn user
          scheduleWarning = `All maintenance personnel are fully booked for ${scheduleDate}. Please manually schedule meter installation through the Assignments page.`;
        } else {
          // Get resident location
          const residentLocation = `Zone ${zone}, Purok ${purok}`;

          // Create the meter installation task
          const installationTask = await ScheduleTask.create({
            connection_id: newConnection._id,
            schedule_date: scheduleDate,
            schedule_time: scheduleTime,
            task_status: 'Assigned',
            assigned_personnel: selectedPersonnel._id,
            schedule_type: 'Meter Installation',
            scheduled_by: req.user.userId,
            location: residentLocation
          });

          // Create assignment record
          await Assignment.create({
            task_id: installationTask._id,
            assigned_to: selectedPersonnel._id
          });

          // Store scheduling details for response
          schedulingDetails = {
            schedule_date: scheduleDate,
            schedule_time: scheduleTime,
            assigned_personnel: {
              id: selectedPersonnel._id,
              name: `${selectedPersonnel.first_name} ${selectedPersonnel.last_name}`
            }
          };

          console.log(`[AddMeter] ✅ Successfully scheduled meter installation for ${scheduleDate} at ${scheduleTime} with ${selectedPersonnel.first_name} ${selectedPersonnel.last_name}`);
        }
      }
    } catch (scheduleError) {
      console.error('Error auto-scheduling meter installation:', scheduleError);
      scheduleWarning = 'Meter added but auto-scheduling failed. Please schedule the installation manually.';
    }

    // Return response
    const responseMsg = scheduleWarning
      ? `New meter added successfully. ${scheduleWarning}`
      : 'New meter added successfully and meter installation task has been automatically scheduled.';

    return res.status(StatusCodes.CREATED).json({
      msg: responseMsg,
      data: {
        connection_id: newConnection._id,
        meter_no: newConnection.meter_no,
        zone: newConnection.zone,
        purok: newConnection.purok,
        type: newConnection.type,
        connection_status: newConnection.connection_status
      },
      warning: scheduleWarning,
      scheduling: schedulingDetails
    });

  } catch (error) {
    console.error('Error adding new meter:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: 'Failed to add new meter',
      error: error.message
    });
  }
};

// ✅ Check if meter number already exists
const checkMeterNumber = async (req, res) => {
  try {
    const { meterNo } = req.params;

    if (!meterNo || meterNo.trim() === "") {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Meter number is required"
      });
    }

    // Check if meter number exists
    const existingMeter = await WaterConnection.findOne({ meter_no: meterNo.trim() });

    if (existingMeter) {
      return res.status(StatusCodes.CONFLICT).json({
        success: false,
        message: `Meter number '${meterNo}' is already in use`,
        exists: true
      });
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Meter number is available",
      exists: false
    });
  } catch (error) {
    console.error("❌ Error checking meter number:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to check meter number",
      error: error.message
    });
  }
};

module.exports = {
  getLatestConnections,
  getAllWaterConnections,
  getActiveWaterConnections,
  getInactiveWaterConnections,
  editResidentAccount,
  updateUserContact,
  verifyEmail,
  getConnectionsForDisconnection,
  getDisconnectedConnections,
  getConnectionsForReconnection,
  getResidentMeters,
  addMeterToResident,
  checkMeterNumber
};
