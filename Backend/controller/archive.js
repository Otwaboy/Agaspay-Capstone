const Resident = require('../model/Resident');
const WaterConnection = require('../model/WaterConnection');
const User = require('../model/User');

// Request archive (Resident when disconnected)
const requestArchive = async (req, res) => {
  try {
    const user = req.user;

    // Get resident record
    const resident = await Resident.findOne({ user_id: user.userId });
    if (!resident) {
      return res.status(404).json({ message: 'Resident record not found' });
    }

    // Check if has water connection and it's disconnected
    const connection = await WaterConnection.findOne({ resident_id: resident._id });
    if (!connection || connection.connection_status !== 'disconnected') {
      return res.status(400).json({ 
        message: 'Archive can only be requested when water connection is disconnected' 
      });
    }

    // Update resident to request archive
    resident.archive_requested = true;
    resident.archive_request_date = new Date();
    await resident.save();

    res.status(200).json({
      success: true,
      message: 'Archive request submitted. Pending admin approval.',
      resident
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get archive requests (Admin only)
const getArchiveRequests = async (req, res) => {
  try {
    const user = req.user;

    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Only Admin can view archive requests' });
    }

    const requests = await Resident.find({ 
      archive_requested: true,
      status: { $ne: 'inactive' }
    }).populate('user_id', 'username');

    res.status(200).json({
      success: true,
      requests
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Approve archive request (Admin only)
const approveArchiveRequest = async (req, res) => {
  try {
    const { resident_id } = req.params;
    const user = req.user;

    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Only Admin can approve archive requests' });
    }

    const resident = await Resident.findById(resident_id);
    if (!resident) {
      return res.status(404).json({ message: 'Resident not found' });
    }

    if (!resident.archive_requested) {
      return res.status(400).json({ message: 'No archive request found for this resident' });
    }

    // Archive the resident
    resident.status = 'inactive';
    await resident.save();

    // Deactivate user account
    await User.findByIdAndUpdate(resident.user_id, { status: 'inactive' });

    res.status(200).json({
      success: true,
      message: 'Resident account archived successfully',
      resident
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Voluntary disconnection (Resident)
const requestVoluntaryDisconnection = async (req, res) => {
  try {
    const user = req.user;
    const { reason } = req.body;

    const resident = await Resident.findOne({ user_id: user.userId });
    if (!resident) {
      return res.status(404).json({ message: 'Resident record not found' });
    }

    const connection = await WaterConnection.findOne({ resident_id: resident._id });
    if (!connection) {
      return res.status(404).json({ message: 'Water connection not found' });
    }

    if (connection.connection_status !== 'active') {
      return res.status(400).json({ 
        message: 'Voluntary disconnection can only be requested for active connections' 
      });
    }

    // Mark for disconnection
    connection.connection_status = 'for_disconnection';
    await connection.save();

    resident.voluntary_disconnection = true;
    await resident.save();

    res.status(200).json({
      success: true,
      message: 'Voluntary disconnection request submitted. Your connection is now marked for disconnection.',
      connection
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  requestArchive,
  getArchiveRequests,
  approveArchiveRequest,
  requestVoluntaryDisconnection
};
