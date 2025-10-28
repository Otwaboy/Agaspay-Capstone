const WaterSchedule = require('../model/WaterSchedule');

// Create new water schedule (Secretary)
const createSchedule = async (req, res) => {
  try {
    const { title, description, service_area, puroks, start_time, end_time, effective_date } = req.body;
    const user = req.user;

    if (!['secretary', 'admin'].includes(user.role)) {
      return res.status(403).json({ message: 'Only Secretary or Admin can create schedules' });
    }

    // Get Personnel ID from User ID
    const Personnel = require('../model/Personnel');
    const personnel = await Personnel.findOne({ user_id: user.userId });
    if (!personnel) {
      return res.status(404).json({ message: 'Personnel record not found' });
    }

    const schedule = await WaterSchedule.create({
      title,
      description,
      service_area,
      puroks,
      start_time,
      end_time,
      effective_date,
      status: 'pending_approval',
      created_by: personnel._id
    });

    res.status(201).json({
      success: true,
      message: 'Schedule created and submitted for approval',
      schedule
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all schedules (filtered by role)
const getSchedules = async (req, res) => {
  try {
    const user = req.user;
    const { status } = req.query;

    let filter = {};
    
    // Residents only see published schedules
    if (user.role === 'resident') {
      filter.status = 'published';
    } else {
      if (status) filter.status = status;
    }

    const schedules = await WaterSchedule.find(filter)
      .populate('created_by', 'first_name last_name role')
      .populate('approved_by', 'first_name last_name')
      .sort({ effective_date: -1 });

    res.status(200).json({
      success: true,
      schedules
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get pending schedules (Admin only)
const getPendingSchedules = async (req, res) => {
  try {
    const user = req.user;

    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Only Admin can view pending schedules' });
    }

    const schedules = await WaterSchedule.find({ status: 'pending_approval' })
      .populate('created_by', 'first_name last_name role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      schedules
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Approve schedule (Admin only)
const approveSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Only Admin can approve schedules' });
    }

    const schedule = await WaterSchedule.findById(id);
    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    if (schedule.status !== 'pending_approval') {
      return res.status(400).json({ message: 'Schedule is not pending approval' });
    }

    // Get Personnel ID from User ID
    const Personnel = require('../model/Personnel');
    const personnel = await Personnel.findOne({ user_id: user.userId });
    if (!personnel) {
      return res.status(404).json({ message: 'Personnel record not found' });
    }

    schedule.status = 'published';
    schedule.approved_by = personnel._id;
    schedule.approval_date = new Date();
    schedule.published_date = new Date();
    await schedule.save();

    res.status(200).json({
      success: true,
      message: 'Schedule approved and published',
      schedule
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reject schedule (Admin only)
const rejectSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Only Admin can reject schedules' });
    }

    const schedule = await WaterSchedule.findById(id);
    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    schedule.status = 'draft';
    await schedule.save();

    res.status(200).json({
      success: true,
      message: 'Schedule rejected and returned to draft',
      schedule
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Archive schedule
const archiveSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    if (!['secretary', 'admin'].includes(user.role)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const schedule = await WaterSchedule.findByIdAndUpdate(
      id,
      { status: 'archived' },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Schedule archived',
      schedule
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createSchedule,
  getSchedules,
  getPendingSchedules,
  approveSchedule,
  rejectSchedule,
  archiveSchedule
};
