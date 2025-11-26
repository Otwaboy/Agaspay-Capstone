require("dotenv").config();
const axios = require('axios');
const { StatusCodes } = require('http-status-codes');
const { BadRequestError, UnauthorizedError } = require('../errors');
const Payment = require('../model/Payment');
const Billing = require('../model/Billing');
const Resident = require('../model/Resident');
const WaterConnection = require('../model/WaterConnection');



const payPayment = async (req, res) => {
  try {
    const user = req.user;
    const { bill_id, payment_method, amount } = req.body;

    if (!bill_id || !payment_method) {
      return res.status(400).json({
        success: false,
        message: "bill_id and payment_method are required",
      });
    }

    if (!process.env.PAYMONGO_SECRET_KEY) {
      return res.status(500).json({
        success: false,
        message: "PAYMONGO_SECRET_KEY not found in environment variables",
      });
    }

    // Fetch billing and resident info
    const billingInfo = await Billing.findById(bill_id).populate({
      path: "connection_id",
      populate: { path: "resident_id", select: "first_name last_name email contact_no" },
    });

    if (!billingInfo) {
      return res.status(404).json({
        success: false,
        message: "Billing record not found",
      });
    }

    // ✅ REMOVED: Old validation that was blocking testing
    // This check was preventing retries during development/testing
    // In production, the unique database index and webhook duplicate prevention handles this

    const resident = billingInfo.connection_id?.resident_id;
    const fullName = resident ? `${resident.first_name} ${resident.last_name}` : "Unknown Resident";
    const email = resident?.email || null;
    const phone = resident?.contact_no || null;

    console.log("Resident Info:", { fullName, email, phone });

    const amountToPay = amount ?? billingInfo.total_amount;

    const paymongoAuth = Buffer.from(process.env.PAYMONGO_SECRET_KEY + ":").toString("base64");
    const headers = {
      Authorization: `Basic ${paymongoAuth}`,
      "Content-Type": "application/json",
    };

    // 1️⃣ Create Payment Intent
    const paymentIntentResponse = await axios.post(
      "https://api.paymongo.com/v1/payment_intents",
      {
        data: {
          attributes: {
            amount: Math.round(amountToPay * 100),
            currency: "PHP",
            payment_method_allowed: ["gcash", "paymaya", "qrph"],
            capture_type: "automatic",
          },
        },
      },
      { headers }
    );

    const paymentIntent = paymentIntentResponse.data.data;

    // 2️⃣ Create Checkout Session
    const baseUrl = req.headers.origin || "http://localhost:5173";
    const checkoutResponse = await axios.post(
      "https://api.paymongo.com/v1/checkout_sessions",
      {
        data: {
          attributes: {
            billing: { name: fullName, phone: phone, email: email },
            line_items: [
              {
                name: `AGASPAY WATER BILL - ${fullName}`,
                amount: Math.round(amountToPay * 100),
                currency: "PHP",
                quantity: 1,
              },
            ],
            payment_intent_id: paymentIntent.id,
            payment_method_types: [payment_method],
            success_url: `${baseUrl}/payment/success?payment_intent_id=${paymentIntent.id}&bill_id=${bill_id}`,
            cancel_url: `${baseUrl}/payment/cancel?payment_intent_id=${paymentIntent.id}`,
            send_email_receipt: false,
          },
        },
      },
      { headers }
    );

    const checkoutSession = checkoutResponse.data.data;

    // 3️⃣ Save temporary fields to billing for webhook
    billingInfo.current_payment_intent = paymentIntent.id;
    billingInfo.current_checkout_session = checkoutSession.id;
    billingInfo.pending_amount = amountToPay;
    await billingInfo.save();

    console.log("✅ Billing updated with payment_intent & checkout_session:", paymentIntent.id, checkoutSession.id);

    // 4️⃣ Respond to frontend
    res.status(200).json({
      success: true,
      msg: "Payment initialized",
      payment_intent_id: paymentIntent.id,
      payment_method: payment_method,
      checkoutUrl: checkoutSession.attributes.checkout_url,
    });
  } catch (error) {
    console.error("❌ PAYMENT CREATION ERROR");
    console.error("  Message:", error.message);
    console.error("  Code:", error.code);
    console.error("  Status:", error.response?.status);
    console.error("  PayMongo Error Response:", JSON.stringify(error.response?.data, null, 2));
    console.error("  Stack:", error.stack);

    if (error.response?.data) {
      console.error("❌ PayMongo API returned error");
      return res.status(error.response.status || 400).json({
        success: false,
        message: "PayMongo API Error",
        error: error.response.data,
        details: error.response.data?.errors?.[0]?.detail || error.message
      });
    }

    console.error("❌ Internal payment error occurred");
    res.status(500).json({
      success: false,
      message: "Payment processing failed",
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}


const verifyPayment = async (req, res) => {


  try {
    const { payment_intent_id } = req.query;

    if (!payment_intent_id) {
      return res.status(400).json({
        success: false,
        message: "payment_intent_id is required",
      });
    }

    console.log("🔍 Verifying payment:", payment_intent_id);

    // 🔹 Check if payment exists in database (webhook has processed it)
    // Payment could be referenced by payment_intent_id OR checkout_session_id (prefixed with "checkout_")
    const payment = await Payment.findOne({
      $or: [
        { payment_reference: payment_intent_id },
        { payment_reference: new RegExp(`^checkout_`) } // Also check for checkout_session format
      ]
    }).populate('bill_id');

    if (payment) {
      // ✅ Payment found in database - webhook has processed it
      console.log("✅ Payment found in database:", payment._id, "Reference:", payment.payment_reference);
      return res.status(200).json({
        success: true,
        payment_recorded: true,
        status: 'succeeded',
        payment_details: {
          _id: payment._id,
          amount_paid: payment.amount_paid,
          payment_method: payment.payment_method,
          payment_status: payment.payment_status,
          payment_reference: payment.payment_reference,
          created_at: payment.createdAt
        }
      });
    }

    // 🔹 Payment not in database yet, check PayMongo status
    const paymongoAuth = Buffer.from(process.env.PAYMONGO_SECRET_KEY + ":").toString("base64");
    
    const response = await axios.get(
      `https://api.paymongo.com/v1/payment_intents/${payment_intent_id}`,
      {
        headers: {
          Authorization: `Basic ${paymongoAuth}`,
        },
      }
    );

    const paymentIntent = response.data.data;
    const paymongoStatus = paymentIntent.attributes.status;

    console.log("📊 PayMongo status:", paymongoStatus, "- Not in DB yet");

    // ⏳ Payment succeeded on PayMongo but not yet in our database
    // This means webhook hasn't fired yet or is processing
    return res.status(200).json({
      success: true,
      payment_recorded: false,
      status: paymongoStatus,
      message: paymongoStatus === 'succeeded' 
        ? 'Payment successful on PayMongo, waiting for webhook to process'
        : 'Payment not yet completed'
    });

  } catch (error) {
    console.error("❌ PAYMENT VERIFICATION ERROR");
    console.error("  Payment Intent ID:", payment_intent_id);
    console.error("  Error Message:", error.message);
    console.error("  Status:", error.response?.status);
    console.error("  PayMongo Response:", JSON.stringify(error.response?.data, null, 2));

    // If payment_intent not found, it might be invalid
    if (error.response?.status === 404) {
      console.error("  ❌ Payment intent not found on PayMongo");
      return res.status(404).json({
        success: false,
        payment_recorded: false,
        message: "Payment not found on PayMongo",
        payment_intent_id: payment_intent_id
      });
    }

    console.error("  ❌ PayMongo verification failed");
    return res.status(500).json({
      success: false,
      message: "Failed to verify payment on PayMongo",
      error: error.message,
      payment_intent_id: payment_intent_id
    });
  }
};


// mo return ug daghan
// const getPayment = async (req, res) => {
//     const user = req.user;

//     if (!user) {
//         throw new UnauthorizedError("You're not authorized");
//     }

//     // Populate bill_id -> connection_id -> resident_id
//     const payments = await Payment.find({}).populate({
//         path: "bill_id",
//         populate: {
//             path: "connection_id",
//             populate: {
//                 path: "resident_id",   // resident reference
//                 select: "first_name last_name"
//             }
//         }
//     });

//     // Map payments to include resident full name
//     const result = payments.map(payment => {
//         const connection = payment.bill_id?.connection_id;
//         const resident = connection?.resident_id;
//         const fullName = resident ? `${resident.first_name} ${resident.last_name}` : null;

//         return {
//             ...payment.toObject(),
//             residentFullName: fullName
//         };
//     });

//     res.status(StatusCodes.OK).json(result);
// };

const getPayment = async (req, res) => {
    const user = req.user;
    const { connection_id } = req.query; // Get connection_id from query params

    if (!user) {
        throw new UnauthorizedError("You're not authorized");
    }

    let query = {};

    // FIX: Build query based on user role (same pattern as getBilling)
    if (user.role === 'resident') {
        // Step 1: Find resident record linked to this user
        const resident = await Resident.findOne({ user_id: user.userId });

        if (!resident) {
            return res.status(StatusCodes.OK).json({
                data: [],
                msg: 'No resident record found for this user'
            });
        }

        // Step 2: If connection_id provided, use it; otherwise get all connections
        let connectionIds;
        if (connection_id) {
            // Verify this connection belongs to this resident
            const connection = await WaterConnection.findOne({
                _id: connection_id,
                resident_id: resident._id
            });

            if (!connection) {
                return res.status(StatusCodes.FORBIDDEN).json({
                    data: [],
                    msg: 'You do not have access to this water connection'
                });
            }

            connectionIds = [connection._id];
        } else {
            // Get all connections for this resident
            const connections = await WaterConnection.find({ resident_id: resident._id });

            if (!connections || connections.length === 0) {
                return res.status(StatusCodes.OK).json({
                    data: [],
                    msg: 'No water connection found for this resident'
                });
            }

            connectionIds = connections.map(c => c._id);
        }

        // Step 3: Find bills for those connections
        const bills = await Billing.find({ connection_id: { $in: connectionIds } }).select('_id');
        const billIds = bills.map(b => b._id);

        // Step 4: Filter payments by those bill IDs
        query = { bill_id: { $in: billIds } };

    } else if (user.role === 'treasurer' || user.role === 'admin') {
        // TREASURER/ADMIN: No filter, get all payments
        query = {};
    } else {
        throw new UnauthorizedError("You don't have permission to view payments");
    }

    // Populate bill_id -> connection_id -> resident_id
    const payments = await Payment.find(query).populate({
        path: "bill_id",
        populate: {
            path: "connection_id",
            populate: {
                path: "resident_id",
                select: "first_name last_name purok"
            }
        }
    }).sort({ payment_date: -1 }); // Sort by newest first

    // Map payments to include only the desired fields
    const result = payments.map(payment => {
        const connection = payment.bill_id?.connection_id;
        const resident = connection?.resident_id;
        const fullName = resident ? `${resident.first_name} ${resident.last_name}` : null;
        const purok = resident?.purok;
        const billPeriod =  payment.bill_id?.due_date

        return {
            payment_id: payment._id,
            connection_id: connection?._id,
            amount_paid: payment.amount_paid,
            payment_method: payment.payment_method,
            payment_type: payment.payment_type,
            payment_status: payment.payment_status,
            official_receipt_status: payment.official_receipt_status,
            payment_reference: payment.payment_reference,
            payment_date: payment.payment_date,
            createdAt: payment.createdAt,
            updatedAt: payment.updatedAt,
            residentFullName: fullName,
            billPeriod: billPeriod,
            purok: purok
        };
    });

    res.status(StatusCodes.OK).json({ data: result });
};


 

const updatePaymentStatus = async (req, res) => {
    const user = req.user; // currently logged-in treasurer
    const { id: paymentId } = req.params;

    if (!user) {
        throw new UnauthorizedError("You're not authorized");
    }

    if (user.role !== "treasurer") {
        throw new UnauthorizedError("Only treasurers can confirm payments");
    }

    const payment = await Payment.findById(paymentId).populate({
        path: "bill_id",
        populate: {
            path: "connection_id",
            populate: {
                path: "resident_id",
                select: "first_name last_name"
            }
        }
    });

    if (!payment) {
        throw new NotFoundError("Payment not found");
    }

    // Update payment status and record treasurer
    payment.payment_status = "confirmed";
    payment.confirmed_by = user._id;

    await Payment.findByIdAndUpdate(
    paymentId,
    { payment_status: 'confirmed', confirmed_by: user._id },
    { new: true, runValidators: true }
);

    // Prepare a clean response
    const connection = payment.bill_id?.connection_id;
    const resident = connection?.resident_id;
    const fullName = resident ? `${resident.first_name} ${resident.last_name}` : null;

    res.status(StatusCodes.OK).json({
        msg: "Payment confirmed successfully",
        payment: {
            amount_paid: payment.amount_paid,
            payment_method: payment.payment_method,
            payment_type: payment.payment_type,
            payment_status: payment.payment_status,
            official_receipt_status: payment.official_receipt_status,
            confirmed_by: user.userId, // or full name if available
            payment_date: payment.payment_date,
            createdAt: payment.createdAt,
            updatedAt: payment.updatedAt,
            residentFullName: fullName
        }
    });
};



 

/**
 * Record Manual/Walk-in Payment
 * - Only treasurer can record manual payments
 * - Supports partial payments
 * - Automatically updates billing status based on amount paid
 */
const recordManualPayment = async (req, res) => {
  try {
    const user = req.user;
    const { bill_id, amount_paid, payment_method, connection_status } = req.body;

    // ✅ Authorization: Only treasurer can record manual payments
    if (user.role !== 'treasurer') {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: 'Only treasurer can record manual payments'
      });
    }

    // ✅ Validation
    if (!bill_id || !amount_paid || !payment_method) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'bill_id, amount_paid, and payment_method are required'
      });
    }

    if (amount_paid <= 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Amount paid must be greater than 0'
      });
    }

    // ✅ Find the billing record
    const billing = await Billing.findById(bill_id).populate({
      path: 'connection_id',
      populate: {
        path: 'resident_id',
        select: 'first_name last_name contact_no'
      }
    });

    if (!billing) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Billing record not found'
      });
    }

    // ✅ Calculate new totals
    const previousAmountPaid = billing.amount_paid || 0;
    const newAmountPaid = previousAmountPaid + amount_paid;
    const newBalance = billing.total_amount - newAmountPaid;

    // ✅ Prevent overpayment
    if (newBalance < 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: `Payment amount exceeds remaining balance. Remaining balance: ₱${(billing.total_amount - previousAmountPaid).toFixed(2)}`
      });
    }

    // ✅ Determine payment type and new billing status
    let payment_type;
    let new_billing_status;

    if (newBalance === 0) {
      payment_type = 'full';
      new_billing_status = 'paid';
    } else {
      payment_type = 'partial';
      new_billing_status = 'partial';
    }

    // ✅ Create payment record
    const payment = await Payment.create({
      bill_id: billing._id,
      connection_id: billing.connection_id._id,
      amount_paid: amount_paid,
      payment_method: payment_method,
      payment_type: payment_type,
      payment_status: 'confirmed', // Manual payments are immediately confirmed
      payment_date: new Date(),
      received_by: user.userId,
      confirmed_by: user.userId,
      official_receipt_status: 'official_receipt' // ✅ Manual payments get official receipt
    });

    // ✅ Update billing record
    billing.amount_paid = newAmountPaid;
    billing.balance = newBalance;
    billing.status = new_billing_status;
    await billing.save();

    // ✅ If bill is fully paid, mark all bills included in its previous_balance as paid
    // Because this bill includes all previous unpaid amounts
    if (newBalance === 0 && billing.previous_balance > 0) {
      // Find all bills for this connection that are older and have unpaid/consolidated status
      const olderBills = await Billing.find({
        connection_id: billing.connection_id._id,
        status: { $in: ['unpaid', 'partial', 'consolidated'] },
        generated_at: { $lt: billing.generated_at }
      }).sort({ generated_at: -1 });

      if (olderBills.length > 0) {
        // Mark all older unpaid/consolidated bills as paid
        await Billing.updateMany(
          {
            connection_id: billing.connection_id._id,
            status: { $in: ['unpaid', 'partial', 'consolidated'] },
            generated_at: { $lt: billing.generated_at }
          },
          { $set: { status: 'paid' } }
        );
        console.log(`✅ Marked ${olderBills.length} older bills as paid because they're included in this bill's previous_balance`);
      }
    }

    // ✅ Auto update connection status to for_reconnection if in disconnection flow
    let reconnectionUpdated = false;
    if (billing.connection_id && connection_status) {
      const connection = await WaterConnection.findById(billing.connection_id._id);
      const validStatuses = ['for_disconnection', 'scheduled_for_disconnection', 'disconnected'];
      if (connection && validStatuses.includes(connection_status)) {
        const oldStatus = connection.connection_status;
        connection.connection_status = 'for_reconnection';
        await connection.save();
        reconnectionUpdated = true;
        console.log(`✅ Water connection ${connection._id} status updated from ${oldStatus} to for_reconnection (auto reconnection after payment)`);
      }
    }

    console.log('✅ Manual payment recorded:', {
      payment_id: payment._id,
      bill_id: billing._id,
      amount_paid: amount_paid,
      new_total_paid: newAmountPaid,
      remaining_balance: newBalance,
      status: new_billing_status,
      reconnection_auto_updated: reconnectionUpdated
    });

    // ✅ Prepare response
    const resident = billing.connection_id?.resident_id;
    const residentName = resident ? `${resident.first_name} ${resident.last_name}` : 'Unknown';

    return res.status(StatusCodes.CREATED).json({
      success: true,
      message: `Payment recorded successfully. ${newBalance === 0 ? 'Bill fully paid!' : 'Partial payment recorded.'}`,
      data: {
        payment_id: payment._id,
        resident_name: residentName,
        amount_paid: amount_paid,
        payment_method: payment_method,
        payment_type: payment_type,
        payment_date: payment.payment_date,
        official_receipt_status: payment.official_receipt_status,
        billing_status: new_billing_status,
        total_amount: billing.total_amount,
        amount_paid_total: newAmountPaid,
        remaining_balance: newBalance
      }
    });

  } catch (error) {
    console.error('🔥 recordManualPayment error:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to record payment',
      error: error.message
    });
  }
};

/**
 * Update Official Receipt Status
 * - Only treasurer can update official receipt status
 * - Can only update from 'temporary_receipt' to 'official_receipt'
 */
const updateOfficialReceiptStatus = async (req, res) => {
  try {
    const user = req.user;
    const { id: paymentId } = req.params;

    // ✅ Authorization: Only treasurer can update receipt status
    if (user.role !== 'treasurer') {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: 'Only treasurer can update official receipt status'
      });
    }

    // ✅ Find the payment
    const payment = await Payment.findById(paymentId).populate({
      path: "bill_id",
      populate: {
        path: "connection_id",
        populate: {
          path: "resident_id",
          select: "first_name last_name"
        }
      }
    });

    if (!payment) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // ✅ Check if current status is temporary_receipt
    if (payment.official_receipt_status !== 'temporary_receipt') {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: `Cannot update receipt status. Current status is '${payment.official_receipt_status}'`
      });
    }

    // ✅ Update to official_receipt
    payment.official_receipt_status = 'official_receipt';

    // ✅ If payment is confirmed but doesn't have confirmed_by, set it
    if (payment.payment_status === 'confirmed' && !payment.confirmed_by) {
      payment.confirmed_by = user.userId;
    }

    await payment.save();

    // ✅ Prepare response
    const connection = payment.bill_id?.connection_id;
    const resident = connection?.resident_id;
    const fullName = resident ? `${resident.first_name} ${resident.last_name}` : null;

    console.log('✅ Official receipt status updated:', {
      payment_id: payment._id,
      resident: fullName,
      updated_by: user.userId
    });

    return res.status(StatusCodes.OK).json({
      success: true,
      message: 'Official receipt status updated successfully',
      data: {
        payment_id: payment._id,
        amount_paid: payment.amount_paid,
        payment_method: payment.payment_method,
        payment_type: payment.payment_type,
        payment_status: payment.payment_status,
        official_receipt_status: payment.official_receipt_status,
        payment_date: payment.payment_date,
        residentFullName: fullName
      }
    });

  } catch (error) {
    console.error('🔥 updateOfficialReceiptStatus error:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to update official receipt status',
      error: error.message
    });
  }
};

module.exports = { payPayment, getPayment, updatePaymentStatus, verifyPayment, recordManualPayment, updateOfficialReceiptStatus };
