const WaterConnection = require("../model/WaterConnection");
const Resident = require("../model/Resident");
const Reading = require("../model/Meter-reading");

// Fetch all active water connections with resident + last reading
const getAllConnections = async (req, res) => {
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

module.exports = { getAllConnections };
