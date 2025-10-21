
const Billing = require('../model/Billing')
const {BadRequestError, UnauthorizedError} = require('../errors')
const {StatusCodes} = require('http-status-codes')
const Reading = require('../model/Meter-reading')
const WaterConnection = require('../model/WaterConnection')
const Resident = require('../model/Resident')
const MeterReading = require('../model/Meter-reading')
const Rate = require("../model/Rate")
const Payment = require("../model/Payment")
const {sendOverdueReminder} = require("../utils/sms")

 
const getBilling = async (req, res) => {
  const user = req.user;
  let filter = {};

  console.log("Logged-in resident username:", user.username);

  if (user.role === 'resident') {
    // Step 1: Find resident record linked to this user
    const resident = await Resident.findOne({ user_id: user.userId });

    if (!resident) {
      return res.status(StatusCodes.NOT_FOUND).json({
        msg: 'No water connection found for this resident',
        billingDetails: []
      });
    }

    // Step 2: Find the water connection for that resident
    const connection = await WaterConnection.findOne({ resident_id: resident._id });
    if (!connection) {
      return res.status(StatusCodes.NOT_FOUND).json({
        msg: 'No water connection found for this resident',
        billingDetails: []
      });
    }

    // Step 3: Filter by that connection
    filter.connection_id = connection._id;
  }

  // Step 4: Get the billings
  const billings = await Billing.find(filter).populate({
    path: 'connection_id',
    populate: {
      path: 'resident_id',
      select: 'first_name last_name'
    }
  });

  // Step 5: Attach meter reading info
  const billingDetails = await Promise.all(
    billings.map(async (billing) => {
      const connection = billing.connection_id;
      const resident = connection.resident_id;

      // ✅ Find latest reading for this connection
     const reading = await MeterReading.findById(billing.reading_id);

      return {
        bill_id: billing?._id ?? 'unknown',
        connection_id: connection?._id,
        full_name: resident ? `${resident.first_name} ${resident.last_name}` : 'unknown',
        meter_no: connection?.meter_no,
        purok_no: connection?.purok ?? 'unknown',
        total_amount: billing?.total_amount,  // ✅ fixed
        status: billing?.status ?? 'unknown',

        // ✅ Add these fields
        previous_reading: reading?.previous_reading ?? 0,
        present_reading: reading?.present_reading ?? 0,
        calculated: reading?.calculated ?? 0,
        due_date: billing?.due_date ?? 0,
        created_at: reading?.created_at
      };
    })
  );

  res.status(StatusCodes.OK).json({
    msg: 'Billing records retrieved successfully',
    data: billingDetails
  });
};


/**
 * Controller: createBilling
 *
 * What it does:
 *  - Only the treasurer can generate a bill
 *  - Ensures the reading exists
 *  - Prevents duplicate bills for the same reading
 *  - Always saves reading_id as an ObjectId (not a raw string)
 *  - Logs and verifies the save so we know DB is consistent
 */
const createBilling = async (req, res) => {
  try {
    const { reading_id, rate_id, due_date } = req.body;
    const user = req.user;

    // ✅ Only treasurer can generate bills
    if (user.role !== "treasurer") {
      throw new UnauthorizedError("Only treasurer can generate a bill.");
    }

    // ✅ Make sure the reading exists
    const reading = await MeterReading.findById(reading_id);
    if (!reading) {
      throw new BadRequestError("Meter reading not found.");
    }

    // ✅ Make sure the rate exists
    const rate = await Rate.findById(rate_id);
    if (!rate) {
      throw new BadRequestError("Rate not found.");
    }

    // ✅ Prevent duplicates (check if a bill already exists for this reading)
    const existingBill = await Billing.findOne({
      $or: [
        { reading_id: reading._id },
        { reading_id: reading._id.toString() }
      ],
    });

    if (existingBill) {
      return res.status(StatusCodes.CONFLICT).json({
        message: "A bill already exists for this reading.",
        billing: existingBill,
      });
    }

    // ✅ Compute total amount
    const total_amount = reading.calculated * rate.amount;

    // ✅ Create billing and save directly with computed total_amount
    const billing = await Billing.create({
      connection_id: reading.connection_id,
      reading_id: reading._id,
      rate_id: rate._id,
      due_date,
      generated_by: user.userId,
      total_amount, // <-- now saved
    });

    console.log("🧾 Billing created successfully:");
    console.log("- reading_id:", reading._id.toString());
    console.log("- rate_id:", rate._id.toString());
    console.log("- consumption:", reading.calculated);
    console.log("- rate amount:", rate.amount);
    console.log("- total_amount:", total_amount);

    return res.status(StatusCodes.CREATED).json({ billing });

  } catch (error) {
    console.error("🔥 createBilling error:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Failed to create billing",
      error: error.message,
    });
  }
};


//continue
const getOverdueBilling = async (req, res) => {
  try {
    const user = req.user;
    // ✅ Only treasurer can access overdue accounts
    if (user.role !== 'treasurer') {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        msg: 'Unauthorized. Only treasurer can access overdue accounts.',
      });
    }
    const currentDate = new Date();
    // ✅ Find all overdue billings
    const overdueBillings = await Billing.find({
      $or: [
        { status: 'overdue' },
        { 
          status: { $in: ['unpaid', 'partial'] }, 
          due_date: { $lt: currentDate } 
        }
      ]
    })
    .populate({
      path: 'connection_id',
      select: 'connection_id meter_no purok resident_id',
      populate: {
        path: 'resident_id',
        select: 'first_name last_name contact_no purok'
      }
    })
    .sort({ due_date: 1 });
    // ✅ Process each overdue billing
    const overdueAccounts = await Promise.all(
      overdueBillings.map(async (billing) => {
        const connection = billing.connection_id;
        const resident = connection?.resident_id;
        if (!resident || !connection) {
          return null;
        }
        // ✅ Calculate months overdue
        const dueDate = new Date(billing.due_date);
        const monthsDiff = Math.floor((currentDate - dueDate) / (1000 * 60 * 60 * 24 * 30));
        const monthsOverdue = Math.max(1, monthsDiff);
        // ✅ Find last payment
        const lastPayment = await Payment.findOne({ 
          connection_id: connection._id,
          payment_status: 'confirmed'
        })
        .sort({ payment_date: -1 })
        .limit(1);
        // ✅ Determine status
        let status = 'moderate';
        if (monthsOverdue >= 3) {
          status = 'critical';
        } else if (monthsOverdue >= 2) {
          status = 'warning';
        }
        return {
          id: billing._id,
          residentName: `${resident.first_name} ${resident.last_name}`,
          accountNo: connection.connection_id || connection.meter_no,
          meterNo: connection.meter_no,
          purok: resident.purok || connection.purok || 'N/A',
          totalDue: billing.total_amount,
          monthsOverdue: monthsOverdue,
          lastPayment: lastPayment ? lastPayment.payment_date : null,
          dueDate: billing.due_date,
          status: status,
          contactNo: resident.contact_no || 'N/A',
          billPeriod: billing.generated_at
        };
      })
    );
    const validAccounts = overdueAccounts.filter(account => account !== null);
    // ✅ Calculate summary
    const totalOutstanding = validAccounts.reduce((sum, acc) => sum + acc.totalDue, 0);
    const criticalCount = validAccounts.filter(acc => acc.status === 'critical').length;
    res.status(StatusCodes.OK).json({
      msg: 'Overdue accounts retrieved successfully',
      data: validAccounts,
      summary: {
        totalOutstanding: totalOutstanding,
        criticalCount: criticalCount,
        totalAccounts: validAccounts.length
      }
    });
  } catch (error) {
    console.error('🔥 getOverdueBilling error:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: 'Failed to retrieve overdue accounts',
      error: error.message
    });
  }
};
/**
 * Controller: sendReminderSMS
 * 
 * Purpose: Send SMS reminder to a resident about their overdue balance
 * Access: Treasurer only
 */
const sendReminderSMS = async (req, res) => {
  try {
    const user = req.user;
    const { billingId } = req.body;
    // ✅ Only treasurer can send reminders
    if (user.role !== 'treasurer') {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        msg: 'Unauthorized. Only treasurer can send reminders.',
      });
    }
    // ✅ Validate billing ID
    if (!billingId) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        msg: 'Billing ID is required',
      });
    }
    // ✅ Find billing with populated data
    const billing = await Billing.findById(billingId)
      .populate({
        path: 'connection_id',
        select: 'meter_no resident_id',
        populate: {
          path: 'resident_id',
          select: 'first_name last_name contact_no'
        }
      });
    if (!billing) {
      return res.status(StatusCodes.NOT_FOUND).json({
        msg: 'Billing record not found',
      });
    }
    const connection = billing.connection_id;
    const resident = connection?.resident_id;
    if (!resident) {
      return res.status(StatusCodes.NOT_FOUND).json({
        msg: 'Resident information not found',
      });
    }
    // ✅ Check contact number
    if (!resident.contact_no) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        msg: 'Resident contact number not available',
      });
    }
    // ✅ Calculate months overdue
    const currentDate = new Date();
    const dueDate = new Date(billing.due_date);
    const monthsDiff = Math.floor((currentDate - dueDate) / (1000 * 60 * 60 * 24 * 30));
    const monthsOverdue = Math.max(1, monthsDiff);
    // ✅ Send SMS
    const reminderData = {
      residentName: `${resident.first_name} ${resident.last_name}`,
      contactNo: resident.contact_no,
      totalDue: billing.total_amount,
      monthsOverdue: monthsOverdue,
      dueDate: billing.due_date
    };
    console.log('📤 Sending overdue reminder SMS:', reminderData);
    
    const smsResult = await sendOverdueReminder(reminderData);
    if (smsResult.success) {
      return res.status(StatusCodes.OK).json({
        msg: 'SMS reminder sent successfully',
        data: {
          recipient: smsResult.recipient,
          residentName: reminderData.residentName,
          sentAt: new Date()
        }
      });
    } else {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        msg: 'Failed to send SMS reminder',
        error: smsResult.error
      });
    }
  } catch (error) {
    console.error('🔥 sendReminderSMS error:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: 'Failed to send reminder',
      error: error.message
    });
  }
};


 



module.exports = {createBilling, getBilling, getOverdueBilling, sendReminderSMS} 