const axios = require('axios');

/**
 * Send SMS using PhilSMS API
 * @param {string} recipient - Phone number in format: +639XXXXXXXXX or 09XXXXXXXXX
 * @param {string} message - SMS message content
 * @returns {Promise<object>} - API response
 */
async function sendSMS(recipient, message) {
  try {
    const apiKey = process.env.PHILSMS_API_KEY;
    
    if (!apiKey) {
      throw new Error('PhilSMS API key not configured');
    }

    // Format phone number - ensure it's in correct format
    let formattedNumber = recipient.trim();
    
    // Remove any non-digit characters except +
    formattedNumber = formattedNumber.replace(/[^\d+]/g, '');
    
    // Convert to international format (+639XXXXXXXXX)
    if (formattedNumber.startsWith('0')) {
      formattedNumber = '63' + formattedNumber.substring(1);
    } else if (formattedNumber.startsWith('+63')) {
      formattedNumber = formattedNumber.substring(1);
    } else if (!formattedNumber.startsWith('63')) {
      formattedNumber = '63' + formattedNumber;
    }

    console.log(`📱 Sending SMS to: ${formattedNumber}`);

    // PhilSMS API endpoint - using standard SMS gateway format
    const response = await axios.post(
      'https://app.philsms.com/api/v3/sms/send',
      {
        recipient: formattedNumber,
        sender_id: 'PhilSMS',
        type: 'plain',
        message: message
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 10000 // 10 second timeout
      }
    );

    console.log('✅ SMS sent successfully to:', formattedNumber);
    console.log('Response:', response.data);
    
    return {
      success: true,
      data: response.data,
      recipient: formattedNumber
    };

  } catch (error) {
    console.error('❌ SMS sending failed:', error.response?.data || error.message);
    
    // Return error info instead of throwing to allow graceful handling
    return {
      success: false,
      error: error.response?.data?.message || error.message,
      recipient: recipient
    };
  }
}

/**
 * Send overdue balance reminder SMS
 * @param {object} params - Reminder parameters
 * @param {string} params.residentName - Resident's full name
 * @param {string} params.contactNo - Resident's phone number
 * @param {number} params.totalDue - Total amount due
 * @param {number} params.monthsOverdue - Number of months overdue
 * @param {string} params.dueDate - Original due date
 * @returns {Promise<object>} - SMS sending result
 */
async function sendOverdueReminder({ residentName, contactNo, totalDue, monthsOverdue, dueDate }) {
  const formattedAmount = 'PHP ' + new Intl.NumberFormat('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(totalDue);

  const formattedDate = new Date(dueDate).toLocaleDateString('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const message = `[AGASPAY] Dear ${residentName},

AGASPAY Water Bill Reminder:
You have an overdue balance of ${formattedAmount} (${monthsOverdue} month${monthsOverdue > 1 ? 's' : ''} overdue).

Due Date: ${formattedDate}

Please settle your balance at the end of time.

Thank you.
- Barangay Biking Water Works (AGASPAY)`;

  return await sendSMS(contactNo, message);
}

module.exports = {
  sendSMS,
  sendOverdueReminder
};