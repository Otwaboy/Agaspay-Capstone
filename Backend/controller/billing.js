
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
  const { connection_id } = req.query; // Get connection_id from query params
  let filter = {};

  console.log("Logged-in user:", user.username, "Role:", user.role);

  // Treasurer, Secretary, and Admin can view all billings
  if (user.role === 'treasurer' || user.role === 'secretary' || user.role === 'admin') {
    // No filter applied - they can see all billing records
    console.log(`${user.role} accessing all billing records`);
  }
  else if (user.role === 'resident') {
    // Step 1: Find resident record linked to this user
    const resident = await Resident.findOne({ user_id: user.userId });

    if (!resident) {
      return res.status(StatusCodes.NOT_FOUND).json({
        msg: 'No water connection found for this resident',
        billingDetails: []
      });
    }

    // Step 2: If connection_id is provided in query, use it; otherwise get all connections
    if (connection_id) {
      // Verify this connection belongs to this resident
      const connection = await WaterConnection.findOne({
        _id: connection_id,
        resident_id: resident._id
      });

      if (!connection) {
        return res.status(StatusCodes.FORBIDDEN).json({
          msg: 'You do not have access to this water connection'
        });
      }

      filter.connection_id = connection._id;
    } else {
      // Get all connections for this resident
      const connections = await WaterConnection.find({ resident_id: resident._id });

      if (!connections || connections.length === 0) {
        return res.status(StatusCodes.NOT_FOUND).json({
          msg: 'No water connection found for this resident',
          billingDetails: []
        });
      }

      // Filter by all connections owned by this resident
      filter.connection_id = { $in: connections.map(c => c._id) };
    }
  }
  else {
    // Unauthorized role
    return res.status(StatusCodes.UNAUTHORIZED).json({
      msg: 'Unauthorized access to billing records'
    });
  }

  // Step 4: Get the billings
  const billings = await Billing.find(filter).populate({
    path: 'connection_id',
    populate: {
      path: 'resident_id',
      select: 'first_name last_name purok'
    }
  });

  // Step 5: Attach meter reading info
  const billingDetails = await Promise.all(
    billings.map(async (billing) => {
      const connection = billing.connection_id;
      const resident = connection?.resident_id;

      // ✅ Find latest reading for this connection
      const reading = await MeterReading.findById(billing.reading_id);

      // ✅ Find payment date if bill is paid
      let paid_date = null;
      if (billing.status === 'paid') {
        const payment = await Payment.findOne({
          billing_id: billing._id,
          payment_status: 'confirmed'
        }).sort({ payment_date: -1 });
        paid_date = payment?.payment_date ?? null;
      }

      return {
        bill_id: billing?._id ?? 'unknown',
        connection_id: connection?._id ?? 'unknown',
        connection_status: connection?.connection_status ?? 'unknown',
        full_name: resident ? `${resident.first_name} ${resident.last_name}` : 'unknown',
        meter_no: connection?.meter_no ?? 'unknown',
        purok_no: resident?.purok ?? 'unknown',

        // 💰 CUMULATIVE BILLING BREAKDOWN
        previous_balance: billing?.previous_balance ?? 0,    // Unpaid balance from previous months
        current_charges: billing?.current_charges ?? 0,      // This month's consumption charges
        total_amount: billing?.total_amount ?? 0,            // Total = previous + current
        amount_paid: billing?.amount_paid ?? 0,              // ✅ Amount paid so far
        balance: (billing?.total_amount ?? 0) - (billing?.amount_paid ?? 0),  // ✅ Always calculate fresh balance

        status: billing?.status ?? 'unknown',

        // ✅ Meter reading details
        previous_reading: reading?.previous_reading ?? 0,
        present_reading: reading?.present_reading ?? 0,
        calculated: reading?.calculated ?? 0,
        due_date: billing?.due_date ?? null,
        created_at: reading?.created_at ?? null,
        paid_date: paid_date  // ✅ Payment date for paid bills
      };
    })
  );

  res.status(StatusCodes.OK).json({
    msg: 'Billing records retrieved successfully',
    data: billingDetails
  }); 
};



/*
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

    // ✅ IMPORTANT: Only allow bill generation for approved readings
    if (reading.reading_status !== 'approved') {
      throw new BadRequestError(`Cannot generate bill. Reading must be approved first (current status: ${reading.reading_status}).`);
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

    // ✅ so the value of the current_charges is to multipy the calculated and the amount rate
    //ex: calculated is 2 and the the rate is 1 so 2x1 = 2 so the current_charges is 2
    const current_charges = reading.calculated * rate.amount;

    // 💰 CUMULATIVE BILLING: Find all unpaid bills for this connection (including consolidated)
    // Consolidated bills must be included because they represent previously unpaid amounts that
    // are still outstanding and should be carried forward to the new bill
    const unpaidBills = await Billing.find({
      connection_id: reading.connection_id,
      status: { $in: ['unpaid', 'partial', 'overdue', 'consolidated'] }
    });

    // 💰 Sum up all unpaid amounts to get previous balance
    //accumalator method  hahaha
    //summing all the array into a one final value
    //sum started at zero so basically 0 + 2 = 2 then 2 + 4 = 6 , 6+ 12 = 18
    // ✅ FIX: Use 'balance' instead of 'current_charges' to account for partial payments
    // If balance doesn't exist, fall back to total_amount (for old bills)

    const previous_balance = unpaidBills.reduce((sum, bill) => {
      return sum + (bill.balance || bill.total_amount || 0);
    }, 0); 

    // 💰 Total amount = previous unpaid balance + current month charges
    const total_amount = previous_balance + current_charges;

    // ✅ Create billing and save with cumulative amounts
    const billing = await Billing.create({
      connection_id: reading.connection_id,
      reading_id: reading._id,
      rate_id: rate._id,
      due_date,
      generated_by: user.userId,
      previous_balance,      // ← unpaid balance from previous months
      current_charges,       // ← this month's consumption charges
      total_amount,          // ← total = previous + current
      balance: total_amount, // ← initialize balance with total_amount
    });

    // ✅ Mark all previous unpaid bills as 'consolidated' to hide them from active view
    // They're now rolled into the new cumulative bill
    if (unpaidBills.length > 0) {
      await Billing.updateMany(
        {
          _id: { $in: unpaidBills.map(b => b._id) }
        },
        {
          $set: { status: 'consolidated' }
        }
      );
      console.log(`✅ Consolidated ${unpaidBills.length} previous unpaid bill(s) into new bill`);
    }

    console.log("🧾 Billing created successfully with cumulative amounts:");
    console.log("- reading_id:", reading._id.toString());
    console.log("- rate_id:", rate._id.toString());
    console.log("- consumption:", reading.calculated);
    console.log("- rate amount:", rate.amount);
    console.log("- current_charges:", current_charges);
    console.log("- previous_balance:", previous_balance);
    console.log("- total_amount:", total_amount);
    if (previous_balance > 0) {
      console.log(`💡 ${unpaidBills.length} unpaid bill(s) accumulated in previous_balance`);
    }

    return res.status(StatusCodes.CREATED).json({ billing });

  } catch (error) {
    console.error("🔥 createBilling error:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Failed to create billing",
      error: error.message,
    });
  }
};



const getOverdueBilling = async (req, res) => {
  try {
    const user = req.user;

    // Only treasurer or admin can access overdue accounts
    if (user.role !== 'treasurer' && user.role !== 'admin' && user.role !== 'secretary') {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        msg: 'Unauthorized. Only treasurer can access overdue accounts.',
      });
    }

    const currentDate = new Date();

    // Find all unpaid/outstanding billings (including those not yet due)
    // Outstanding balances include all unpaid amounts, not just past-due ones
    const overdueBillings = await Billing.find({
      status: { $in: ['unpaid', 'partial', 'overdue', 'consolidated'] }
    })
    .populate({
      path: 'connection_id',
      select: 'connection_id meter_no purok resident_id connection_status',
      populate: {
        path: 'resident_id',
        select: 'first_name last_name contact_no purok'
      }
    })
    .sort({ due_date: 1 });

    console.log('📊 Found overdue billings:', overdueBillings.length, 'billings');
    overdueBillings.forEach(b => {
      console.log(`  - Bill ${b._id}: status=${b.status}, due_date=${b.due_date}, connection_id=${b.connection_id}`);
    });

    const overdueAccounts = await Promise.all(
      overdueBillings.map(async (billing) => {
        const connection = billing.connection_id;
        const resident = connection?.resident_id;

        if (!resident || !connection) {
          console.log('⚠️ Filtering out billing (missing resident/connection):', {
            billing_id: billing._id,
            connection_id: billing.connection_id,
            has_connection: !!connection,
            has_resident: !!resident
          });
          return null;
        }
        // Fetch ALL unpaid bills for this connection (including consolidated ones)
  const unpaidBills = await Billing.find({
            connection_id: connection._id,
            status: { $in: ['unpaid', 'partial', 'overdue', 'consolidated'] }
          }).sort({ due_date: 1 }); // ascending, earliest first

      // Count only the PAST-DUE bills (due_date < today) as months overdue
      // This represents how many consecutive months the account is actually overdue
      const pastDueBills = unpaidBills.filter(bill => new Date(bill.due_date) < currentDate);
      const monthsOverdue = Math.max(1, pastDueBills.length);

      // Get the earliest past-due bill for due date reference
      const earliestPastDueBill = pastDueBills[0] || unpaidBills[0] || billing;
      const dueDate = new Date(earliestPastDueBill.due_date);

        const lastPayment = await Payment.findOne({ 
          connection_id: connection._id,
          payment_status: 'confirmed'
        })
        .sort({ payment_date: -1 })
        .limit(1);

        let status = 'moderate';
        if (monthsOverdue >= 3) status = 'critical';
        else if (monthsOverdue >= 2) status = 'warning';

     return {
            id: billing._id,
            connection_id: connection._id, // for API calls
            residentName: `${resident.first_name} ${resident.last_name}`,
            accountNo: connection.connection_id || connection.meter_no,
            meterNo: connection.meter_no,
            purok: resident.purok || connection.purok || 'N/A',
            totalDue: billing.total_amount,
            monthsOverdue,
            lastPayment: lastPayment ? lastPayment.payment_date : null,
            dueDate: billing.due_date,
            status,
            connection_status: connection.connection_status || 'N/A', // ✅ actual status
            contactNo: resident.contact_no || 'N/A',
            billPeriod: billing.generated_at
          };
      })
    );

    const validAccounts = overdueAccounts.filter(account => account !== null);
    console.log('✅ Valid overdue accounts:', validAccounts.length, '(filtered', overdueAccounts.length - validAccounts.length, 'null records)');

    // GROUP BY meterNo so each resident shows only once
    //Think of reduce() as a way to take a whole array and combine it into one final value.
    // so basically iyang e group tapos e combine all into a one value

      const groupedAccounts = Object.values(
      validAccounts.reduce((acc, curr) => {
        const key = curr.meterNo;

        if (!acc[key]) {
          // First bill for this meter - initialize with current bill data
          acc[key] = {
            ...curr,
            totalDue: curr.totalDue,  // ✅ Start accumulating total due
            bills: [curr.id]  // Track which bills are included
          };
        } else {
          // Additional bills for same meter - with cumulative billing, the latest bill already includes all previous amounts
          // So we replace with the latest bill instead of summing
          acc[key].bills.push(curr.id);  // Track this bill

          // Keep the latest billing (based on creation date, not due date) for all amounts
          // Due date might not be chronological, but creation date reflects actual bill sequence
          const existingCreateDate = new Date(acc[key].billPeriod);
          const currentCreateDate = new Date(curr.billPeriod);

          if (currentCreateDate > existingCreateDate) {
            // Current bill is newer - replace with current bill's data (which already includes previous balances)
            acc[key].totalDue = curr.totalDue;  // ✅ Use latest bill's amount (not sum)
            acc[key].dueDate = curr.dueDate;
            acc[key].billPeriod = curr.billPeriod;
            acc[key].id = curr.id;
            acc[key].lastPayment = curr.lastPayment;
          }

          // Take highest months overdue
          acc[key].monthsOverdue = Math.max(acc[key].monthsOverdue, curr.monthsOverdue);

          // Recalculate final status based on final monthsOverdue
          if (acc[key].monthsOverdue >= 3) acc[key].status = 'critical';
          else if (acc[key].monthsOverdue >= 2) acc[key].status = 'warning';
          else acc[key].status = 'moderate';
        }

        return acc;
      }, {})
    );

    // Summary (use cleanedAccounts for accurate calculations)
    const cleanedAccounts = groupedAccounts.map(acc => {
      const { bills, ...rest } = acc;
      return rest;
    });

    const totalOutstandingBalance = cleanedAccounts.reduce((sum, acc) => sum + acc.totalDue, 0);
    const criticalCount = cleanedAccounts.filter(acc => acc.status === 'critical').length;

    console.log('📈 Final grouped accounts:', cleanedAccounts.length, 'accounts');
    cleanedAccounts.forEach(acc => {
      console.log(`  - ${acc.residentName} (${acc.meterNo}): ₱${acc.totalDue}, ${acc.monthsOverdue} months overdue, status=${acc.status}`);
    });

    return res.status(StatusCodes.OK).json({
      msg: 'Overdue accounts retrieved successfully',
      data: cleanedAccounts,
      summary: {
        totalOutstandingBalance,
        criticalCount,
        totalAccounts: cleanedAccounts.length
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




const UpdateWaterConnectionStatus = async (req, res) => {
  try {
    const user = req.user;
    const { connection_id } = req.body;

    // ✅ Only treasurer or admin can perform disconnection evaluation
    if (user.role !== "treasurer" && user.role !== "admin") {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        msg: "Unauthorized. Only treasurer or admin can update connection status."
      });
    }

    if (!connection_id) {
      return res.status(StatusCodes.BAD_REQUEST).json({ msg: "connection_id is required." });
    }

    // ✅ Get all unpaid, overdue or partial bills (including consolidated) sorted from oldest to newest
    const unpaidBills = await Billing.find({
      connection_id,
      status: { $in: ["unpaid", "partial", "overdue", "consolidated"] }
    }).sort({ due_date: 1 });

    if (unpaidBills.length === 0) {
      return res.status(StatusCodes.OK).json({
        msg: "No unpaid bills found. Connection remains active."
      });
    }

    // ✅ Count the number of unpaid bills as consecutive months
    // Each bill represents one billing cycle (one month)
    const consecutiveMonths = unpaidBills.length;

    // ✅ If 3 or more consecutive months overdue → Mark for disconnection
    if (consecutiveMonths >= 3) {
      await WaterConnection.findByIdAndUpdate(connection_id, {
        $set: { connection_status: "for_disconnection" }
      });

      return res.status(StatusCodes.OK).json({
        msg: `Connection marked for disconnection. (${consecutiveMonths} consecutive unpaid months detected)`,
        connection_id
      });
    }

    // ✅ Otherwise keep active
    return res.status(StatusCodes.OK).json({
      msg: `Connection remains active. Only ${consecutiveMonths} consecutive unpaid month(s) detected.`,
      connection_id
    });

  } catch (error) {
    console.error("🔥 UpdateWaterConnectionStatus error:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: "Failed to update connection status",
      error: error.message
    });
  }
};



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

    // ✅ Find ALL unpaid/overdue bills for this connection (same logic as getOverdueBilling)
    const allOverdueBills = await Billing.find({
      connection_id: billing.connection_id,
      status: { $in: ['unpaid', 'partial', 'overdue', 'consolidated'] }
    }).sort({ due_date: 1 }); // Ascending - earliest first

    if (allOverdueBills.length === 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        msg: 'No overdue bills found for this account',
      });
    }

    // ✅ Get the EARLIEST unpaid bill
    const earliestBill = allOverdueBills[0];
    const earliestDueDate = new Date(earliestBill.due_date);

    // ✅ Calculate months overdue as the NUMBER of unpaid bills (each bill = 1 month)
    const monthsOverdue = Math.max(1, allOverdueBills.length);

    // ✅ Calculate total overdue amount (sum of ALL unpaid bills)
    const totalDueAmount = allOverdueBills.reduce((sum, bill) => sum + (bill.total_amount || 0), 0);

    // ✅ Send SMS
    const reminderData = {
      residentName: `${resident.first_name} ${resident.last_name}`,
      contactNo: resident.contact_no,
      totalDue: totalDueAmount,
      monthsOverdue: monthsOverdue,
      dueDate: earliestDueDate
    };

    console.log('🔍 Connection ID:', connection._id);
    console.log('🔍 Earliest unpaid bill due date:', earliestDueDate);
    console.log('🔍 Total unpaid bills found:', allOverdueBills.length);
    console.log('📊 Months overdue (count of unpaid bills):', monthsOverdue);
    console.log('💰 Total unpaid amount:', totalDueAmount);
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


 



module.exports = {createBilling, getBilling, getOverdueBilling, sendReminderSMS, UpdateWaterConnectionStatus} 