const WaterConnection = require("../model/WaterConnection");
const Resident = require("../model/Resident");
const Reading = require("../model/Meter-reading");

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
  try {
    const connections = await WaterConnection.find({})
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

          // payload for the user information
          first_name: conn.resident_id.first_name,
          last_name: conn.resident_id.last_name,
          purok: conn.resident_id.purok,
          zone: conn.resident_id.zone
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


const updateUserContact = async (req, res) => {
  try {
    const user = req.user;

    // Ensure user exists
    if (!user) {
      return res.status(401).json({ message: "Unauthorized: User not logged in" });
    }

    const { email, contact_no } = req.body;

    // Validate
    if (!email && !contact_no) {
      return res.status(400).json({ 
        message: "Nothing to update. Please provide email or contact_no." 
      });
    }

    // Find resident using user_id reference
    const resident = await Resident.findOne({ user_id: user.userId });

    if (!resident) {
      return res.status(404).json({ message: "Resident not found" });
    }

    // Update only fields allowed
    if (email) resident.email = email;
    if (contact_no) resident.contact_no = contact_no;

    await resident.save();

    res.status(200).json({
      message: "Contact information updated successfully",
      data: {
        email: resident.email,
        contact_no: resident.contact_no,
        updated_at: new Date()
      }
    });

  } catch (error) {
    console.error("Error updating contact info:", error);
    res.status(500).json({ message: "Failed to update contact information" });
  }
};





module.exports = { getLatestConnections, getAllWaterConnections, getActiveWaterConnections,getInactiveWaterConnections, editResidentAccount, updateUserContact };
