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

    const billingInfo = await Billing.findById(bill_id).populate({
      path: "connection_id",
      populate: { path: "resident_id", select: "first_name last_name email contact_no" }
    });

    if (!billingInfo) return res.status(404).json({ success: false, message: "Billing not found" });

    const resident = billingInfo.connection_id?.resident_id;
    const fullName = resident ? `${resident.first_name} ${resident.last_name}` : "Unknown";
    const email = resident?.email || null;
    const phone = resident?.contact_no || null;

    const amountToPay = amount ?? billingInfo.total_amount;

    const paymongoAuth = Buffer.from(process.env.PAYMONGO_SECRET_KEY + ":").toString("base64");
    const headers = {
      Authorization: `Basic ${paymongoAuth}`,
      "Content-Type": "application/json"
    };

    // ✅ Create PayMongo Payment Intent
    const paymentIntentResponse = await axios.post(
      "https://api.paymongo.com/v1/payment_intents",
      {
        data: {
          attributes: {
            amount: Math.round(amountToPay * 100),
            currency: "PHP",
            payment_method_allowed: ["gcash", "paymaya", "qrph"],
            capture_type: "automatic"
          }
        }
      },
      { headers }
    );

    const paymentIntent = paymentIntentResponse.data.data;

    const baseUrl = req.headers.origin || "http://localhost:5173";

    // ✅ Checkout Session
    const checkoutResponse = await axios.post(
      "https://api.paymongo.com/v1/checkout_sessions",
      {
        data: {
          attributes: {
            billing: { name: fullName, phone, email },
            line_items: [
              {
                name: `AGASPAY WATER BILL - ${fullName}`,
                amount: Math.round(amountToPay * 100),
                currency: "PHP",
                quantity: 1
              }
            ],
            payment_intent_id: paymentIntent.id,
            payment_method_types: [payment_method],
            success_url: `${baseUrl}/payment/success`,
            cancel_url: `${baseUrl}/payment/cancel`,
            send_email_receipt: false,
          }
        }
      },
      { headers }
    );

    const checkoutSession = checkoutResponse.data.data;

    // ✅ Return checkout URL (NO DB SAVE YET)
    return res.json({
      success: true,
      message: "Proceed to payment",
      bill_id,
      payment_intent_id: paymentIntent.id,
      checkout_url: checkoutSession.attributes.checkout_url
    });

  } catch (error) {
    console.error("PayMongo Error:", error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      message: "Payment initialization failed",
      error: error.response?.data || error.message
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

        // Step 2: Find the water connection for that resident
        const connection = await WaterConnection.findOne({ resident_id: resident._id });
        
        if (!connection) {
            return res.status(StatusCodes.OK).json({ 
                data: [],
                msg: 'No water connection found for this resident'
            });
        }

        // Step 3: Find bills for that connection
        const bills = await Billing.find({ connection_id: connection._id }).select('_id');
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



 

module.exports = { payPayment, getPayment, updatePaymentStatus };
