const Announcement = require('../model/Announcement');

// Create new announcement (Secretary)
const createAnnouncement = async (req, res) => {
  try {
    const { title, content, category, priority, valid_until } = req.body;
    const user = req.user;

    if (!['secretary', 'admin'].includes(user.role)) {
      return res.status(403).json({ message: 'Only Secretary or Admin can create announcements' });
    }

    // Get Personnel ID from User ID
    const Personnel = require('../model/Personnel');
    const personnel = await Personnel.findOne({ user_id: user.userId });
    if (!personnel) {
      return res.status(404).json({ message: 'Personnel record not found' });
    }

    const announcement = await Announcement.create({
      title,
      content,
      category,
      priority,
      valid_until,
      status: 'pending_approval',
      created_by: personnel._id
    });

    res.status(201).json({
      success: true,
      message: 'Announcement created and submitted for approval',
      announcement
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
 
// Get all announcements (filtered by role)
const getAnnouncements = async (req, res) => {
  try {
    const user = req.user;
    const { status } = req.query;

    let filter = {};
    
    // Residents only see published announcements
    if (user.role === 'resident') {
      filter.status = 'published';
      // Only filter by valid_until if it exists (allow indefinite announcements)
      filter.$or = [
        { valid_until: { $gte: new Date() } },
        { valid_until: { $exists: false } },
        { valid_until: null }
      ];
    } else {
      // Personnel can see all
      if (status) filter.status = status;
    }

    const announcements = await Announcement.find(filter)
      .populate('created_by', 'first_name last_name role')
      .populate('approved_by', 'first_name last_name')
      .populate('rejected_by', 'first_name last_name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      announcements
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get pending announcements (Admin only)
const getPendingAnnouncements = async (req, res) => {
  try {
    const user = req.user;

    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Only Admin can view pending announcements' });
    }

    const announcements = await Announcement.find({ status: 'pending_approval' })
      .populate('created_by', 'first_name last_name role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      announcements
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Approve announcement (Admin only)
const approveAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Only Admin can approve announcements' });
    }

    const announcement = await Announcement.findById(id);
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    if (announcement.status !== 'pending_approval') {
      return res.status(400).json({ message: 'Announcement is not pending approval' });
    }

    // Get Personnel ID from User ID
    const Personnel = require('../model/Personnel');
    const personnel = await Personnel.findOne({ user_id: user.userId });
    if (!personnel) {
      return res.status(404).json({ message: 'Personnel record not found' });
    }

    announcement.status = 'published';
    announcement.approved_by = personnel._id;
    announcement.approval_date = new Date();
    announcement.published_date = new Date();
    await announcement.save();

    res.status(200).json({
      success: true,
      message: 'Announcement approved and published',
      announcement
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reject announcement (Admin only)
const rejectAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejection_reason } = req.body;
    const user = req.user;

    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Only Admin can reject announcements' });
    }

    if (!rejection_reason || rejection_reason.trim() === '') {
      return res.status(400).json({ message: 'Rejection reason is required' });
    }

    const announcement = await Announcement.findById(id);
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    // Get Personnel ID from User ID
    const Personnel = require('../model/Personnel');
    const personnel = await Personnel.findOne({ user_id: user.userId });
    if (!personnel) {
      return res.status(404).json({ message: 'Personnel record not found' });
    }

    announcement.status = 'reject';
    announcement.rejection_reason = rejection_reason;
    announcement.rejected_by = personnel._id;
    announcement.rejection_date = new Date();
    await announcement.save();

    res.status(200).json({
      success: true,
      message: 'Announcement rejected and returned to draft',
      announcement
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Archive announcement
const archiveAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    if (!['secretary', 'admin'].includes(user.role)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const announcement = await Announcement.findByIdAndUpdate(
      id,
      { status: 'archived' },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Announcement archived',
      announcement
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Increment views
const incrementViews = async (req, res) => {
  try {
    const { id } = req.params;
    
    const announcement = await Announcement.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { new: true }
    );

    res.status(200).json({ success: true, views: announcement.views });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createAnnouncement,
  getAnnouncements,
  getPendingAnnouncements,
  approveAnnouncement,
  rejectAnnouncement,
  archiveAnnouncement,
  incrementViews
};
