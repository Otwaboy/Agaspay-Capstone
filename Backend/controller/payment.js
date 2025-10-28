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

    // 🔹 Validate required fields
    if (!bill_id || !payment_method) {
      return res.status(400).json({
        success: false,
        message: "bill_id and payment_method are required",
      });
    }

    // 🔹 Validate PayMongo secret key
    if (!process.env.PAYMONGO_SECRET_KEY) {
      return res.status(500).json({
        success: false,
        message: "PAYMONGO_SECRET_KEY not found in environment variables",
      });
    }

    // 🔹 Get full resident info via Billing (not Payment)
    const billingInfo = await Billing.findById(bill_id).populate({
      path: "connection_id",
      populate: {
        path: "resident_id",
        select: "first_name last_name email contact_no",
      },
    });

    if (!billingInfo) {
      return res.status(404).json({
        success: false,
        message: "Billing record not found",
      });
    }

    // ✅ Extract resident details
    const connection = billingInfo.connection_id;
    const resident = connection?.resident_id;
    const fullName = resident ? `${resident.first_name} ${resident.last_name}` : "Unknown Resident";
    const email = resident?.email || null;
    const phone = resident?.contact_no || null;

    console.log("Resident Info:", { fullName, email, phone });

    const amountToPay = amount ?? billingInfo.total_amount;

    // 🔹 Create local Payment record (before PayMongo)
    const payment = await Payment.create({
      bill_id,
      amount_paid: amountToPay,
      payment_method,
      payment_type: amountToPay < billingInfo.total_amount ? "partial" : "full",
      payment_status: "pending",
      payment_reference: null,
    });

    // 🔹 Prepare PayMongo request
    const paymongoAuth = Buffer.from(process.env.PAYMONGO_SECRET_KEY + ":").toString("base64");

    const headers = {
      Authorization: `Basic ${paymongoAuth}`,
      "Content-Type": "application/json",
    };

    // 🔹 Create Payment Intent
    const paymentIntentResponse = await axios.post(
      "https://api.paymongo.com/v1/payment_intents",
      {
        data: {
          attributes: {
            amount: Math.round(amountToPay * 100), // PayMongo uses centavos
            currency: "PHP",
            payment_method_allowed: ["gcash", "paymaya"],
            capture_type: "automatic",
          },
        },
      },
      { headers }
    );

    const paymentIntent = paymentIntentResponse.data.data;

    // 🔹 Build frontend URLs
    const baseUrl = req.headers.origin || "http://localhost:5173";

    // 🔹 Create Checkout Session (with email receipt)
    const checkoutResponse = await axios.post(
      "https://api.paymongo.com/v1/checkout_sessions",
      {
        data: {
          attributes: {
            billing: {
              name: fullName,
              phone: phone,
              email: email,
            },
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
            success_url: `${baseUrl}/payment/success?payment_intent_id=${paymentIntent.id}&status=succeeded`,
            cancel_url: `${baseUrl}/payment/cancel?payment_intent_id=${paymentIntent.id}&status=failed`,
            send_email_receipt: true,
          },
        },
      },
      { headers }
    );

    const checkoutSession = checkoutResponse.data.data;

    // 🔹 Save PayMongo Payment Intent ID as reference
    payment.payment_reference = checkoutSession.attributes.payment_intent.id;
    await payment.save();

    // 🔹 Respond to frontend
    res.status(200).json({
      success: true,
      msg: "Payment initialized",
      paymentId: payment._id,
      payment_reference: payment.payment_reference,
      payment_method: payment.payment_method,
      payment_type: payment.payment_type,
      checkoutUrl: checkoutSession.attributes.checkout_url,
    });
  } catch (error) {
    console.error("PayMongo Error:", error.response?.data || error.message);

    if (error.response?.data) {
      return res.status(400).json({
        success: false,
        message: "PayMongo API Error",
        error: error.response.data,
      });
    }

    res.status(500).json({
      success: false,
      message: "Payment processing failed",
      error: error.message,
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
