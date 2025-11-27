const User = require('../model/User');
const Resident = require('../model/Resident');
const { StatusCodes } = require('http-status-codes');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const Personnel = require('../model/Personnel');

// Store verification codes temporarily (in production, use Redis or database)
const verificationCodes = new Map();

/**
 * Step 1: Request password change - sends verification code to email
 */
const requestPasswordChange = async (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    const user = req.user;

    // Validate inputs
    if (!current_password || !new_password) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Please provide both current and new password'
      });
    }

    // Validate new password strength
    if (new_password.length < 6) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    // Get user from database
    const dbUser = await User.findById(user.userId);
    if (!dbUser) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isPasswordCorrect = await dbUser.comparePassword(current_password);
    if (!isPasswordCorrect) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Get user's email - try resident first, then personnel
    let userRecord = await Resident.findOne({ user_id: user.userId });
    let userEmail = userRecord?.email;
    let userFirstName = userRecord?.first_name;

    // If not a resident, check if they're personnel
    if (!userRecord) {
      userRecord = await Personnel.findOne({ user_id: user.userId });
      userEmail = userRecord?.email;
      userFirstName = userRecord?.first_name;
    }

    // Check if we found any record (resident or personnel)
    if (!userRecord) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'User record not found'
      });
    }

    // Check if user has an email
    if (!userEmail) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'No email address found. Please add an email to your profile first.',
        noEmail: true
      });
    }
    // Generate 6-digit verification code
    const verificationCode = crypto.randomInt(100000, 999999).toString();

    // Store verification code with expiry (10 minutes)
    const codeData = {
      code: verificationCode,
      userId: user.userId,
      newPassword: new_password,
      expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes
    };
    verificationCodes.set(user.userId, codeData);

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
      to: userEmail,
      subject: 'Password Change Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">AGASPAY - Password Change Request</h2>
          <p>Hello ${userFirstName},</p>
          <p>You have requested to change your password. Please use the verification code below:</p>
          <div style="background-color: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #1f2937; font-size: 36px; letter-spacing: 8px; margin: 0;">
              ${verificationCode}
            </h1>
          </div>
          <p style="color: #6b7280;">This code will expire in 10 minutes.</p>
          <p style="color: #6b7280;">If you did not request this change, please ignore this email and your password will remain unchanged.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
          <p style="color: #9ca3af; font-size: 12px;">
            This is an automated email from AGASPAY Water Billing System. Please do not reply to this email.
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    res.status(StatusCodes.OK).json({
      success: true,
      message: `Verification code sent to ${userEmail}`,
      email: userEmail
    });

  } catch (error) {
    console.error('❌ Request password change error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to process password change request',
      error: error.message
    });
  }
};

/**
 * Step 2: Verify code and change password
 */
const verifyAndChangePassword = async (req, res) => {
  try {
    const { verification_code } = req.body;
    const user = req.user;

    if (!verification_code) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Please provide verification code'
      });
    }

    // Get stored verification data
    const storedData = verificationCodes.get(user.userId);

    if (!storedData) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'No pending password change request found. Please start the process again.'
      });
    }

    // Check if code expired
    if (Date.now() > storedData.expiresAt) {
      verificationCodes.delete(user.userId);
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Verification code has expired. Please request a new one.'
      });
    }

    // Verify code
    if (storedData.code !== verification_code) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: 'Invalid verification code'
      });
    }

    // Update password
    const dbUser = await User.findById(user.userId);
    if (!dbUser) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'User not found'
      });
    }

    dbUser.password = storedData.newPassword;
    await dbUser.save();

    // Clean up verification code
    verificationCodes.delete(user.userId);

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Password changed successfully!'
    });

  } catch (error) {
    console.error('❌ Verify and change password error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to change password',
      error: error.message
    });
  }
};

module.exports = {
  requestPasswordChange,
  verifyAndChangePassword
};
