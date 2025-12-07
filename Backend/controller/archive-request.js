const WaterConnection = require('../model/WaterConnection');
const User = require('../model/User');
const Resident = require('../model/Resident');
const { StatusCodes } = require('http-status-codes');

/** 
 * Request account archive (Resident only)
 */
const requestArchive = async (req, res) => {
  try {
    const user = req.user; 
    const { reason } = req.body;

    // Validate reason
    if (!reason || reason.trim().length === 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Please provide a reason for archiving your account'
      });
    }

    if (reason.trim().length < 10) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Reason must be at least 10 characters long'
      });
    }

    // Get resident's water connection
    const resident = await Resident.findOne({ user_id: user.userId });
    if (!resident) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Resident record not found'
      });
    }

    const connection = await WaterConnection.findOne({ resident_id: resident._id });
    if (!connection) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'No water connection found for this resident'
      });
    }

    // Check if already archived or pending archive
    if (connection.archive_status === 'archived') {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Your account is already archived'
      });
    } 

    if (connection.archive_status === 'pending_archive') {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'You already have a pending archive request'
      });
    }

    // Update archive status

    connection.archive_status = 'pending_archive';
    connection.archive_requested_date = new Date();
    connection.archive_reason = reason.trim();
    resident
    await connection.save();

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Archive request submitted successfully. Awaiting admin approval.',
      connection
    });

  } catch (error) {
    console.error('❌ Request archive error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to process archive request',
      error: error.message
    });
  }
};

/**
 * Get archive status (Resident only)
 */
const getArchiveStatus = async (req, res) => {
  try {
    const user = req.user;

    const resident = await Resident.findOne({ user_id: user.userId });
    if (!resident) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Resident record not found'
      });
    }

    const connection = await WaterConnection.findOne({ resident_id: resident._id });
    if (!connection) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'No water connection found'
      });
    }

    // Calculate next allowed request date if rejected
    let next_allowed_request_date = null;
    if (connection.archive_rejection_reason) {
      // If rejected, resident can request again tomorrow
      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + 1);
      next_allowed_request_date = nextDate;
    }

    res.status(StatusCodes.OK).json({
      success: true,
      archive_status: connection.archive_status,
      archive_reason: connection.archive_reason,
      archive_requested_date: connection.archive_requested_date,
      archive_approved_date: connection.archive_approved_date,
      archive_rejection_reason: connection.archive_rejection_reason,
      next_allowed_request_date: next_allowed_request_date
    });

  } catch (error) {
    console.error('❌ Get archive status error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to get archive status',
      error: error.message
    });
  }
};

/**
 * Cancel archive request (Resident only - if still pending)
 */
const cancelArchiveRequest = async (req, res) => {
  try {
    const user = req.user;

    const resident = await Resident.findOne({ user_id: user.userId });
    if (!resident) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Resident record not found'
      });
    }

    const connection = await WaterConnection.findOne({ resident_id: resident._id });
    if (!connection) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'No water connection found'
      });
    }

    if (connection.archive_status !== 'pending_archive') {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'No pending archive request to cancel'
      });
    }

    // Clear archive fields
    connection.archive_status = null;
    connection.archive_reason = null;
    connection.archive_requested_date = null;
    connection.archive_rejection_reason = null;
    await connection.save();

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Archive request cancelled successfully',
      connection
    });

  } catch (error) {
    console.error('❌ Cancel archive error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to cancel archive request',
      error: error.message
    });
  }
};

/**
 * Approve Archive Request (Admin / Treasurer / Secretary)
 */
const approveArchiveRequest = async (req, res) => {
  try {
    const user = req.user;
    const { connection_id } = req.params;

    if (user.role !== 'admin' && user.role !== 'secretary' && user.role !== 'treasurer') {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: 'Only authorized personnel can approve archive requests'
      });
    }

    // Validate connection
    const connection = await WaterConnection.findById(connection_id);
    if (!connection) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Water connection not found'
      });
    }

     const resident = await Resident.findById(connection.resident_id);
    if (!resident) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Resident record not found'
      });
    }

    // Must be pending to approve
    if (connection.archive_status !== 'pending_archive') {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'No pending archive request for this connection'
      });
    }

    resident.status = 'inactive';
    await resident.save();

    // Approve archive - update this connection
    connection.archive_status = 'archived';
    connection.archive_approved_date = new Date();
    connection.archive_rejection_reason = null; // clear previous rejection reason if any
    connection.connection_status = 'for_disconnection'; // Set to for_disconnection
    await connection.save();

    // Update ALL connections for this resident to for_disconnection status
    await WaterConnection.updateMany(
      { resident_id: resident._id },
      {
        connection_status: 'for_disconnection'
      }
    );

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Archive request approved successfully',
      connection
    });
 
  } catch (error) {
    console.error('❌ Approve archive error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to approve archive request',
      error: error.message
    });
  }
};


/**
 * Reject Archive Request (Admin / Treasurer / Secretary)
 */
const rejectArchiveRequest = async (req, res) => {
  try {
    const user = req.user;
    const { connection_id } = req.params;
    const { reason } = req.body;

    if (user.role !== 'admin' && user.role !== 'secretary' && user.role !== 'treasurer') {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: 'Only authorized personnel can reject archive requests'
      });
    }

    // Validate rejection reason
    if (!reason || reason.trim().length < 10) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Rejection reason must be at least 10 characters long'
      });
    }

    // Validate connection
    const connection = await WaterConnection.findById(connection_id);
    if (!connection) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Water connection not found'
      });
    }

    const resident = await Resident.findById(connection.resident_id);
    if (!resident) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Resident record not found'
      });
    } 

    // Must be pending to reject
    if (connection.archive_status !== 'pending_archive') {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'No pending archive request for this connection'
      });
    }

    // Reject archive - clear archive status and set rejection reason
    connection.archive_status = null;
    connection.archive_reason = null;
    connection.archive_requested_date = null;
    connection.archive_rejection_reason = reason.trim();
    await connection.save();

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Archive request rejected successfully',
      connection
    });

  } catch (error) {
    console.error('❌ Reject archive error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to reject archive request',
      error: error.message
    });
  }
};


/**
 * Unarchive User (Admin only)
 */
const unarchiveUser = async (req, res) => {
  try {
    const user = req.user;
    const { connection_id } = req.params;

    if (user.role !== 'admin') {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: 'Only admin can unarchive users'
      });
    }

    // Find the connection
    const connection = await WaterConnection.findById(connection_id);
    if (!connection) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Water connection not found'
      });
    }

    const resident = await Resident.findById(connection.resident_id);
    if (!resident) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Resident record not found'
      });
    }

    // Must be archived to unarchive
    if (connection.archive_status !== 'archived') {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'User is not archived'
      });
    }

    // Restore the account - update this connection
    connection.archive_status = null;
    connection.archive_reason = null;
    connection.archive_requested_date = null;
    connection.archive_approved_date = null;
    connection.archive_rejection_reason = null;
    connection.connection_status = 'for_reconnection'; // Set to for_reconnection
    await connection.save();

    // Restore ALL connections for this resident to for_reconnection status
    await WaterConnection.updateMany(
      { resident_id: resident._id },
      {
        connection_status: 'for_reconnection'
      }
    );

    resident.status = 'active';
    await resident.save();

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'User unarchived successfully',
      connection
    });

  } catch (error) {
    console.error('❌ Unarchive user error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to unarchive user',
      error: error.message
    });
  }
};

module.exports = {
  requestArchive,
  getArchiveStatus,
  cancelArchiveRequest,
  approveArchiveRequest,
  rejectArchiveRequest,
  unarchiveUser
};
