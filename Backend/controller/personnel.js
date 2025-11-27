// Personnel management controller
const Personnel = require('../model/Personnel');
const User = require('../model/User');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

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

// Get current logged-in personnel profile
const getMyProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const personnel = await Personnel.findOne({ user_id: userId })
      .populate('user_id', 'email username role');

    if (!personnel) {
      return res.status(404).json({ message: 'Personnel profile not found' });
    }

    res.status(200).json({
      success: true,
      data: personnel
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update personnel contact information
const updatePersonnelContact = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: "Unauthorized: User not logged in" });
    }

    const { email, contact_no, verification_code } = req.body;

    if (!email && !contact_no && !verification_code) {
      return res.status(400).json({
        message: "Nothing to update. Please provide email, contact_no, or verification code."
      });
    }

    // Find personnel using user_id reference
    const personnel = await Personnel.findOne({ user_id: user.userId });
    if (!personnel) {
      return res.status(404).json({ message: "Personnel not found" });
    }

    // Handle verification code submission
    if (verification_code) {
      if (!personnel.email_verification_code || !personnel.pending_email) {
        return res.status(400).json({ message: "No pending email verification found." });
      }

      if (personnel.email_verification_code !== verification_code) {
        return res.status(400).json({ message: "Invalid verification code." });
      }

      if (personnel.email_verification_expires < new Date()) {
        return res.status(400).json({ message: "Verification code has expired." });
      }

      // Update email in DB
      personnel.email = personnel.pending_email;
      personnel.pending_email = null;
      personnel.email_verification_code = null;
      personnel.email_verification_expires = null;

      await personnel.save();

      return res.status(200).json({
        message: "Email verified and updated successfully.",
        data: { email: personnel.email }
      });
    }

    // Update contact number immediately
    if (contact_no) {
      personnel.contact_no = contact_no;
      await personnel.save();
    }

    // Handle new email with verification
    if (email && email !== personnel.email) {
      // Check if email already exists
      const existingPersonnel = await Personnel.findOne({
        email,
        _id: { $ne: personnel._id }
      });

      if (existingPersonnel) {
        return res.status(400).json({
          message: "Email already in use by another personnel."
        });
      }

      // Generate verification code
      const verificationCode = crypto.randomBytes(3).toString('hex').toUpperCase(); // 6-char code
      personnel.pending_email = email;
      personnel.email_verification_code = verificationCode;
      personnel.email_verification_expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

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
              <p>Hello <strong>${personnel.first_name}</strong>,</p>
              <p>You requested to update your email address for your AGASPAY personnel account.</p>
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
      await personnel.save();

      return res.status(200).json({
        message: "Verification code sent to new email.",
        data: {
          pending_email: email,
          verification_sent: true
        }
      });
    }

    res.status(200).json({
      message: "Contact information updated successfully.",
      data: {
        contact_no: personnel.contact_no,
        email: personnel.email
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Request personnel archive
const requestPersonnelArchive = async (req, res) => {
  try {
    const user = req.user;
    const { reason } = req.body;

    // Validate reason
    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a reason for archiving your account'
      });
    }

    if (reason.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Reason must be at least 10 characters long'
      });
    }

    // Get personnel record
    const personnel = await Personnel.findOne({ user_id: user.userId });
    if (!personnel) {
      return res.status(404).json({
        success: false,
        message: 'Personnel record not found'
      });
    }

    // Check if there's already a pending request
    if (personnel.archive_status === 'pending_archive') {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending archive request'
      });
    }

    // Check if already archived
    if (personnel.archive_status === 'archived') {
      return res.status(400).json({
        success: false,
        message: 'Your account is already archived'
      });
    }

    // Update personnel with archive request
    personnel.archive_status = 'pending_archive';
    personnel.archive_reason = reason.trim();
    personnel.archive_requested_date = new Date();
    personnel.archive_rejection_reason = null;

    await personnel.save();

    res.status(200).json({
      success: true,
      message: 'Archive request submitted successfully',
      data: {
        archive_status: personnel.archive_status,
        archive_requested_date: personnel.archive_requested_date
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get personnel archive status
const getPersonnelArchiveStatus = async (req, res) => {
  try {
    const user = req.user;

    const personnel = await Personnel.findOne({ user_id: user.userId });
    if (!personnel) {
      return res.status(404).json({
        success: false,
        message: 'Personnel record not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        archive_status: personnel.archive_status,
        archive_reason: personnel.archive_reason,
        archive_requested_date: personnel.archive_requested_date,
        archive_approved_date: personnel.archive_approved_date,
        archive_rejection_reason: personnel.archive_rejection_reason
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cancel personnel archive request
const cancelPersonnelArchiveRequest = async (req, res) => {
  try {
    const user = req.user;

    const personnel = await Personnel.findOne({ user_id: user.userId });
    if (!personnel) {
      return res.status(404).json({
        success: false,
        message: 'Personnel record not found'
      });
    }

    if (personnel.archive_status !== 'pending_archive') {
      return res.status(400).json({
        success: false,
        message: 'No pending archive request to cancel'
      });
    }

    // Clear archive fields
    personnel.archive_status = null;
    personnel.archive_reason = null;
    personnel.archive_requested_date = null;
    personnel.archive_rejection_reason = null;

    await personnel.save();

    res.status(200).json({
      success: true,
      message: 'Archive request cancelled successfully'
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Approve personnel archive (Admin only)
const approvePersonnelArchive = async (req, res) => {
  try {
    const { id } = req.params;

    const personnel = await Personnel.findById(id);
    if (!personnel) {
      return res.status(404).json({
        success: false,
        message: 'Personnel not found'
      });
    }

    if (personnel.archive_status !== 'pending_archive') {
      return res.status(400).json({
        success: false,
        message: 'No pending archive request for this personnel'
      });
    }

    // Update personnel archive status
    personnel.archive_status = 'archived';
    personnel.archive_approved_date = new Date();
    await personnel.save();

    // Also update user account status
    if (personnel.user_id) {
      await User.findByIdAndUpdate(personnel.user_id, { status: 'inactive' });
    }

    res.status(200).json({
      success: true,
      message: 'Personnel archive request approved successfully',
      data: personnel
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reject personnel archive (Admin only)
const rejectPersonnelArchive = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    // Validate rejection reason
    if (!reason || reason.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason must be at least 10 characters long'
      });
    }

    const personnel = await Personnel.findById(id);
    if (!personnel) {
      return res.status(404).json({
        success: false,
        message: 'Personnel not found'
      });
    }

    if (personnel.archive_status !== 'pending_archive') {
      return res.status(400).json({
        success: false,
        message: 'No pending archive request for this personnel'
      });
    }

    // Update personnel with rejection
    personnel.archive_status = null;
    personnel.archive_rejection_reason = reason.trim();
    personnel.archive_requested_date = null;
    await personnel.save();

    res.status(200).json({
      success: true,
      message: 'Personnel archive request rejected',
      data: personnel
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Unarchive personnel (Admin only)
const unarchivePersonnel = async (req, res) => {
  try {
    const { id } = req.params;

    const personnel = await Personnel.findById(id);
    if (!personnel) {
      return res.status(404).json({
        success: false,
        message: 'Personnel not found'
      });
    }

    if (personnel.archive_status !== 'archived') {
      return res.status(400).json({
        success: false,
        message: 'Personnel is not archived'
      });
    }

    // Restore personnel account
    personnel.archive_status = null;
    personnel.archive_reason = null;
    personnel.archive_requested_date = null;
    personnel.archive_approved_date = null;
    personnel.archive_rejection_reason = null;
    await personnel.save();

    // Restore user account status if exists
    if (personnel.user_id) {
      await User.findByIdAndUpdate(personnel.user_id, { status: 'active' });
    }

    res.status(200).json({
      success: true,
      message: 'Personnel unarchived successfully',
      data: personnel
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Direct archive by admin (immediate action)
const archivePersonnelDirect = async (req, res) => {
  try {
    const { id } = req.params;

    const personnel = await Personnel.findById(id);
    if (!personnel) {
      return res.status(404).json({
        success: false,
        message: 'Personnel not found'
      });
    }

    // Check if already archived
    if (personnel.archive_status === 'archived') {
      return res.status(400).json({
        success: false,
        message: 'Personnel is already archived'
      });
    }

    // Directly archive the personnel
    personnel.archive_status = 'archived';
    personnel.archive_approved_date = new Date();
    await personnel.save();

    // Also update user account status to inactive
    if (personnel.user_id) {
      await User.findByIdAndUpdate(personnel.user_id, { status: 'inactive' });
    }

    res.status(200).json({
      success: true,
      message: 'Personnel archived successfully',
      data: personnel
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
  deletePersonnel,
  getMyProfile,
  updatePersonnelContact,
  requestPersonnelArchive,
  getPersonnelArchiveStatus,
  cancelPersonnelArchiveRequest,
  approvePersonnelArchive,
  rejectPersonnelArchive,
  unarchivePersonnel,
  archivePersonnelDirect
};
