const WaterConnection = require('../model/WaterConnection');
const User = require('../model/User');
const Resident = require('../model/Resident');
const { StatusCodes } = require('http-status-codes');

/**
 * Request voluntary disconnection (Resident only)
 * Supports single or multiple connections
 */
const requestDisconnection = async (req, res) => {
  try {
    const user = req.user;
    const { connectionIds } = req.body;

    // Get resident's water connection(s)
    const resident = await Resident.findOne({ user_id: user.userId });
    if (!resident) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Resident record not found'
      });
    }

    // If connectionIds provided, use those; otherwise get all resident's connections
    let connections;
    if (connectionIds && Array.isArray(connectionIds) && connectionIds.length > 0) {
      connections = await WaterConnection.find({
        resident_id: resident._id,
        _id: { $in: connectionIds }
      });
    } else {
      connections = await WaterConnection.find({ resident_id: resident._id });
    }

    if (!connections || connections.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'No water connection found for this resident'
      });
    }

    // Update each connection
    const results = [];
    for (const connection of connections) {
      // Check if already disconnected or pending
      if (connection.connection_status === 'disconnected') {
        results.push({
          connectionId: connection._id,
          status: 'error',
          message: 'Already disconnected'
        });
        continue;
      }

      if (connection.connection_status === 'request_for_disconnection') {
        results.push({
          connectionId: connection._id,
          status: 'error',
          message: 'Already has pending request'
        });
        continue;
      }

      connection.connection_status = 'request_for_disconnection';
      connection.disconnection_requested_date = new Date();
      connection.disconnection_type = 'Voluntary';
      await connection.save();

      results.push({
        connectionId: connection._id,
        meterNo: connection.meter_no,
        status: 'success',
        message: 'Disconnection request submitted'
      });
    }

    const successCount = results.filter(r => r.status === 'success').length;

    res.status(StatusCodes.OK).json({
      success: true,
      message: `${successCount} disconnection request(s) submitted successfully. Awaiting admin approval.`,
      results
    });

  } catch (error) {
    console.error('❌ Request disconnection error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to process disconnection request',
      error: error.message
    });
  }
};

/**
 * Get disconnection status (Resident only)
 * Returns status for all resident's connections
 */
const getDisconnectionStatus = async (req, res) => {
  try {
    const user = req.user;

    const resident = await Resident.findOne({ user_id: user.userId });
    if (!resident) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Resident record not found'
      });
    }

    // Get all connections for resident
    const connections = await WaterConnection.find({ resident_id: resident._id });
    if (!connections || connections.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'No water connection found'
      });
    }

    // Return status for all connections
    const connectionsStatus = connections.map(conn => ({
      connectionId: conn._id,
      meterNo: conn.meter_no,
      status: conn.connection_status,
      disconnection_type: conn.disconnection_type,
      disconnection_requested_date: conn.disconnection_requested_date,
      disconnection_approved_date: conn.disconnection_approved_date,
      disconnection_rejection_reason: conn.disconnection_rejection_reason
    }));

    // For backward compatibility, also return first connection status at top level
    const firstConn = connections[0];
    res.status(StatusCodes.OK).json({
      success: true,
      status: firstConn.connection_status,
      disconnection_type: firstConn.disconnection_type,
      disconnection_requested_date: firstConn.disconnection_requested_date,
      disconnection_approved_date: firstConn.disconnection_approved_date,
      disconnection_rejection_reason: firstConn.disconnection_rejection_reason,
      connections: connectionsStatus
    });

  } catch (error) {
    console.error('❌ Get disconnection status error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to get disconnection status',
      error: error.message
    });
  }
};

/**
 * Cancel disconnection request (Resident only - if still pending)
 */
const cancelDisconnectionRequest = async (req, res) => {
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

    if (connection.connection_status !== 'request_for_disconnection') {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'No pending disconnection request to cancel'
      });
    }

    // Restore to active status
    connection.connection_status = 'active';
    connection.disconnection_type = null;
    connection.disconnection_requested_date = null;
    connection.disconnection_rejection_reason = null;
    await connection.save();

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Disconnection request cancelled successfully',
      connection
    });

  } catch (error) {
    console.error('❌ Cancel disconnection error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to cancel disconnection request',
      error: error.message
    });
  }
};



const approveDisconnectionRequest = async (req, res) => {
  try {
    const user = req.user
    const {connection_id} = req.params

    if (user.role !== 'admin' && user.role !== 'secretary' && user.role !== 'treasurer') {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: 'Only authorized personnel can approve disconnection requests'
      });
    }

    const connection = await WaterConnection.findById(connection_id)
    if(!connection){
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Connection not found'
      })
    }

    const resident = await Resident.findById(connection.resident_id)
    if(!resident){
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Resident not found'
      })
    }

    // Must be pending to approve
    if (connection.connection_status !== 'request_for_disconnection') {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'No pending disconnection request for this connection'
      });
    }

    // once the admin approve the disconnection it will be for_disconnection because the schedule_for_disconnection is that is when the secretary schedule it for the maintenance to disconnect the meter
    connection.connection_status = 'for_disconnection';
    connection.disconnection_approved_date = new Date();
    connection.disconnection_rejection_reason = null; // clear previous rejection if any
    await connection.save();

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Disconnection request approved successfully',
      connection
    });

  } catch (error) {
    console.error('❌ Approve disconnection error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to approve disconnection request',
      error: error.message
    });
  }
}

/**
 * Reject Disconnection Request (Admin / Treasurer / Secretary)
 */
const rejectDisconnectionRequest = async (req, res) => {
  try {
    const user = req.user;
    const { connection_id } = req.params;
    const { reason } = req.body;

    if (user.role !== 'admin' && user.role !== 'secretary' && user.role !== 'treasurer') {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: 'Only authorized personnel can reject disconnection requests'
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
    if (connection.connection_status !== 'request_for_disconnection') {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'No pending disconnection request for this connection'
      });
    }

    // Reject disconnection - restore to active and set rejection reason
    connection.connection_status = 'active';
    connection.disconnection_type = null;
    connection.disconnection_requested_date = null;
    connection.disconnection_rejection_reason = reason.trim();
    await connection.save();

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Disconnection request rejected successfully',
      connection
    });

  } catch (error) {
    console.error('❌ Reject disconnection error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to reject disconnection request',
      error: error.message
    });
  }
};


module.exports = {
  requestDisconnection,
  getDisconnectionStatus,
  cancelDisconnectionRequest,
  approveDisconnectionRequest,
  rejectDisconnectionRequest
};
