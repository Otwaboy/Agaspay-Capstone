// Personnel management controller
const Personnel = require('../model/Personnel');
const User = require('../model/User');
const bcrypt = require('bcrypt');

// Get all personnel
const getAllPersonnel = async (req, res) => {
  try {
    const { role, status } = req.query;
    
    let filter = {};
    if (role && role !== 'all') filter.role = role;
    if (status && status !== 'all') filter.status = status;
    
    const personnel = await Personnel.find(filter)
      .populate('user_id', 'email username')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      personnel,
      count: personnel.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single personnel
const getPersonnel = async (req, res) => {
  try {
    const { id } = req.params;
    const personnel = await Personnel.findById(id).populate('user_id', 'email username');
    
    if (!personnel) {
      return res.status(404).json({ message: 'Personnel not found' });
    }
    
    res.status(200).json({
      success: true,
      personnel
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create personnel
const createPersonnel = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      email,
      contact_number,
      role,
      assigned_zone,
      username,
      password
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email or username' });
    }

    // Create user account
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      role,
      status: 'active'
    });

    // Create personnel record
    const personnel = await Personnel.create({
      first_name,
      last_name,
      email,
      contact_number,
      role,
      assigned_zone: role === 'meter_reader' ? assigned_zone : null,
      user_id: user._id,
      status: 'active'
    });

    res.status(201).json({
      success: true,
      message: 'Personnel created successfully',
      personnel
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update personnel
const updatePersonnel = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const personnel = await Personnel.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    if (!personnel) {
      return res.status(404).json({ message: 'Personnel not found' });
    }

    // Update user role if changed
    if (updates.role && personnel.user_id) {
      await User.findByIdAndUpdate(personnel.user_id, { role: updates.role });
    }

    res.status(200).json({
      success: true,
      message: 'Personnel updated successfully',
      personnel
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete personnel (soft delete - set status to inactive)
const deletePersonnel = async (req, res) => {
  try {
    const { id } = req.params;

    const personnel = await Personnel.findByIdAndUpdate(
      id,
      { status: 'inactive' },
      { new: true }
    );

    if (!personnel) {
      return res.status(404).json({ message: 'Personnel not found' });
    }

    // Also deactivate user account
    if (personnel.user_id) {
      await User.findByIdAndUpdate(personnel.user_id, { status: 'inactive' });
    }

    res.status(200).json({
      success: true,
      message: 'Personnel deleted successfully',
      personnel
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllPersonnel,
  getPersonnel,
  createPersonnel,
  updatePersonnel,
  deletePersonnel
};
