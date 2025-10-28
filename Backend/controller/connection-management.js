const WaterConnection = require('../model/WaterConnection');
const ScheduleTask = require('../model/Schedule-task');
const { sendNotification } = require('../services/notification');
const Resident = require('../model/Resident');

// Update connection status
const updateConnectionStatus = async (req, res) => {
  try {
    const { connection_id } = req.params;
    const { status } = req.body;
    const user = req.user;

    if (!['secretary', 'admin', 'treasurer'].includes(user.role)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const validStatuses = [
      'pending_installation',
      'active',
      'for_disconnection',
      'scheduled_for_disconnection',
      'disconnected',
      'scheduled_for_reconnection'
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid connection status' });
    }

    // Check if connection exists before updating
    const connection = await WaterConnection.findById(connection_id).populate('resident_id');
    if (!connection) {
      return res.status(404).json({ message: 'Water connection not found' });
    }

    // Update status
    connection.connection_status = status;
    await connection.save();

    // Send notification based on status change (only if resident exists)
    if (connection.resident_id) {
      if (status === 'scheduled_for_disconnection') {
        await sendNotification(connection.resident_id, 'disconnection_warning', {
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()
        });
      } else if (status === 'disconnected') {
        await sendNotification(connection.resident_id, 'disconnection_notice', {});
      } else if (status === 'scheduled_for_reconnection') {
        await sendNotification(connection.resident_id, 'reconnection_scheduled', {
          date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString()
        });
      }
    }

    res.status(200).json({
      success: true,
      message: 'Connection status updated',
      connection
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// One-click schedule task (Secretary)
const scheduleConnectionTask = async (req, res) => {
  try {
    const { connection_id, task_type } = req.body;
    const user = req.user;

    if (!['secretary', 'admin'].includes(user.role)) {
      return res.status(403).json({ message: 'Only Secretary or Admin can schedule tasks' });
    }

    const connection = await WaterConnection.findById(connection_id).populate('resident_id');
    if (!connection) {
      return res.status(404).json({ message: 'Connection not found' });
    }

    // Auto-schedule to next available slot (next day, 9 AM)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);

    let description = '';
    let newStatus = '';

    switch (task_type) {
      case 'installation':
        description = `Install water meter for ${connection.resident_id.first_name} ${connection.resident_id.last_name}`;
        newStatus = 'pending_installation';
        break;
      case 'disconnection':
        description = `Disconnect water service for ${connection.resident_id.first_name} ${connection.resident_id.last_name}`;
        newStatus = 'scheduled_for_disconnection';
        break;
      case 'reconnection':
        description = `Reconnect water service for ${connection.resident_id.first_name} ${connection.resident_id.last_name}`;
        newStatus = 'scheduled_for_reconnection';
        break;
      default:
        return res.status(400).json({ message: 'Invalid task type' });
    }

    // Create scheduled task
    const task = await ScheduleTask.create({
      connection_id,
      schedule_date: tomorrow,
      schedule_time: '09:00',
      task_status: 'Pending',
      scheduled_by: user.userId,
      description
    });

    // Update connection status
    await WaterConnection.findByIdAndUpdate(connection_id, {
      connection_status: newStatus
    });

    res.status(201).json({
      success: true,
      message: `${task_type} task scheduled successfully`,
      task
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get delinquent accounts (3+ months unpaid)
const getDelinquentAccounts = async (req, res) => {
  try {
    const user = req.user;

    if (user.role !== 'treasurer' && user.role !== 'admin') {
      return res.status(403).json({ message: 'Only Treasurer or Admin can view delinquent accounts' });
    }

    const Billing = require('../model/Billing');
    
    // Find bills with 3+ consecutive unpaid months
    const delinquentBills = await Billing.find({
      consecutive_unpaid_months: { $gte: 3 },
      is_delinquent: true
    }).populate({
      path: 'connection_id',
      populate: { path: 'resident_id' }
    }).sort({ consecutive_unpaid_months: -1 });

    const delinquentAccounts = delinquentBills.map(bill => ({
      bill_id: bill._id,
      connection_id: bill.connection_id._id,
      resident_name: `${bill.connection_id.resident_id.first_name} ${bill.connection_id.resident_id.last_name}`,
      contact: bill.connection_id.resident_id.contact_no,
      consecutive_unpaid_months: bill.consecutive_unpaid_months,
      total_amount: bill.total_amount,
      marked_for_disconnection: bill.marked_for_disconnection,
      connection_status: bill.connection_id.connection_status
    }));

    res.status(200).json({
      success: true,
      delinquentAccounts
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark delinquent for disconnection
const markForDisconnection = async (req, res) => {
  try {
    const { connection_id } = req.params;
    const user = req.user;

    if (user.role !== 'treasurer') {
      return res.status(403).json({ message: 'Only Treasurer can mark for disconnection' });
    }

    const Billing = require('../model/Billing');
    
    // Mark all unpaid bills for this connection
    await Billing.updateMany(
      { connection_id, status: { $in: ['unpaid', 'overdue'] } },
      { marked_for_disconnection: true }
    );

    // Update connection status
    const connection = await WaterConnection.findByIdAndUpdate(
      connection_id,
      { connection_status: 'for_disconnection' },
      { new: true }
    ).populate('resident_id');

    // Send notification
    if (connection.resident_id) {
      await sendNotification(connection.resident_id, 'disconnection_warning', {
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()
      });
    }

    res.status(200).json({
      success: true,
      message: 'Connection marked for disconnection',
      connection
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  updateConnectionStatus,
  scheduleConnectionTask,
  getDelinquentAccounts,
  markForDisconnection
};
