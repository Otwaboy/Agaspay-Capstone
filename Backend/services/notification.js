const axios = require('axios');

// Send SMS via PhilSMS
const sendSMS = async (phoneNumber, message) => {
  try {
    if (!process.env.PHILSMS_API_KEY) {
      console.log('[NOTIFICATION] PhilSMS API key not configured. Skipping SMS.');
      return { success: false, message: 'SMS not configured' };
    }

    const response = await axios.post('https://app.philsms.com/api/v3/sms/send', {
      recipient: phoneNumber,
      sender_id: process.env.PHILSMS_SENDER_ID || 'AGASPAY',
      message: message
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.PHILSMS_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    console.log(`[NOTIFICATION] SMS sent to ${phoneNumber}`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('[NOTIFICATION] SMS error:', error.response?.data || error.message);
    return { success: false, error: error.message };
  }
};

// Send Email (Simple implementation - can be enhanced with SendGrid/Mailgun)
const sendEmail = async (email, subject, message) => {
  try {
    // For now, just log - integrate with email service later
    console.log(`[NOTIFICATION] Email to: ${email}`);
    console.log(`[NOTIFICATION] Subject: ${subject}`);
    console.log(`[NOTIFICATION] Message: ${message}`);
    
    // TODO: Integrate with email service (SendGrid, AWS SES, etc.)
    return { success: true, message: 'Email logged (integration pending)' };
  } catch (error) {
    console.error('[NOTIFICATION] Email error:', error.message);
    return { success: false, error: error.message };
  }
};

// Notification templates
const templates = {
  billing: (residentName, amount, dueDate) => 
    `Dear ${residentName}, your water bill of PHP ${amount} is now available. Due date: ${dueDate}. Please pay on time to avoid penalties. - AGASPAY`,
  
  payment_confirmed: (residentName, amount) =>
    `Dear ${residentName}, your payment of PHP ${amount} has been confirmed. Thank you! - AGASPAY`,
  
  disconnection_warning: (residentName, dueDate) =>
    `IMPORTANT: Dear ${residentName}, your water connection is scheduled for disconnection on ${dueDate} due to unpaid bills. Please settle immediately. - AGASPAY`,
  
  disconnection_notice: (residentName) =>
    `Dear ${residentName}, your water connection has been disconnected due to unpaid bills. Please visit the barangay hall to settle. - AGASPAY`,
  
  reconnection_scheduled: (residentName, date) =>
    `Dear ${residentName}, your water reconnection is scheduled on ${date}. Thank you for settling your account. - AGASPAY`,
  
  announcement: (title, content) =>
    `ANNOUNCEMENT: ${title}. ${content} - AGASPAY`,
  
  schedule_update: (area, startTime, endTime) =>
    `Water Schedule Update for ${area}: ${startTime} to ${endTime}. Please take note. - AGASPAY`
};

// Send notification (Email + SMS)
const sendNotification = async (resident, type, data) => {
  try {
    let message = '';
    let subject = '';

    switch (type) {
      case 'billing':
        message = templates.billing(resident.first_name, data.amount, data.dueDate);
        subject = 'New Water Bill Available';
        break;
      case 'payment_confirmed':
        message = templates.payment_confirmed(resident.first_name, data.amount);
        subject = 'Payment Confirmed';
        break;
      case 'disconnection_warning':
        message = templates.disconnection_warning(resident.first_name, data.dueDate);
        subject = 'Water Disconnection Warning';
        break;
      case 'disconnection_notice':
        message = templates.disconnection_notice(resident.first_name);
        subject = 'Water Connection Disconnected';
        break;
      case 'reconnection_scheduled':
        message = templates.reconnection_scheduled(resident.first_name, data.date);
        subject = 'Reconnection Scheduled';
        break;
      case 'announcement':
        message = templates.announcement(data.title, data.content);
        subject = `Announcement: ${data.title}`;
        break;
      case 'schedule_update':
        message = templates.schedule_update(data.area, data.startTime, data.endTime);
        subject = 'Water Schedule Update';
        break;
      default:
        message = data.message || 'You have a new notification from AGASPAY';
        subject = data.subject || 'AGASPAY Notification';
    }

    const results = {};

    // Send SMS if contact number exists
    if (resident.contact_no) {
      results.sms = await sendSMS(resident.contact_no, message);
    }

    // Send Email if email exists
    if (resident.email) {
      results.email = await sendEmail(resident.email, subject, message);
    }

    return results;
  } catch (error) {
    console.error('[NOTIFICATION] Error:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendSMS,
  sendEmail,
  sendNotification,
  templates
};
