require("dotenv").config();
const axios = require('axios');
const Stripe = require("stripe");
const { StatusCodes } = require('http-status-codes');
const { BadRequestError, UnauthorizedError } = require('../errors');
const Payment = require('../model/Payment');
const Billing = require('../model/Billing');
const Resident = require('../model/Resident');
const WaterConnection = require('../model/WaterConnection');

const stripe = require("stripe")(process.env.PAYMONGO_SECRET_KEY);
; // use env in production


const payPayment = async (req, res) => {
  try {
    const user = req.user;
    const { bill_id, payment_method, amount } = req.body;

    //getting the fullname
    const info = await Payment.find({}).populate({
      path: "bill_id",
      populate: {
        path: "connection_id",
        populate: {
          path: "resident_id",
          select: "first_name last_name email contact_no"
        }
      }
    });

    const connection = info.bill_id?.connection_id;
    const resident = connection?.resident_id;
    const fullName = resident ? `${resident.first_name} ${resident.last_name}` : null;
    const email = resident?.email || null;
    const phone = resident?.contact_no || null;

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

    // 🔹 Find billing record
    const billing = await Billing.findById(bill_id);
    if (!billing) {
      return res.status(404).json({
        success: false,
        message: "Billing record not found",
      });
    }

    const amountToPay = amount ?? billing.total_amount;

    // 🔹 Create local Payment record (reference will be added after PayMongo response)
    const payment = await Payment.create({
      bill_id,
      amount_paid: amountToPay,
      payment_method,
      payment_type: amountToPay < billing.total_amount ? "partial" : "full",
      payment_status: "pending",
      payment_reference: null, // will be updated later
    });

    // 🔹 Prepare PayMongo request
    //a safely way to verify paymongo that my api is legit
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
            amount: Math.round(amountToPay * 100), //JavaScript function that rounds a number to the nearest integer. ex (4.2) = (4.5) = 5
            currency: "PHP",
            payment_method_allowed: ["gcash", "paymaya"],
            capture_type: "automatic",
          },
        },
      },
      { headers } // so these part i called headers authorization para ma verify sa paymongo api
                  // basically to post these api request we need a legit nga authentication
    );

    const paymentIntent = paymentIntentResponse.data.data;

    // 🔹 Build frontend URLs
    const baseUrl = req.headers.origin || "http://localhost:5173";

    //  Create Checkout Session
    const checkoutResponse = await axios.post(
      "https://api.paymongo.com/v1/checkout_sessions",
      {
        data: {
          attributes: {
            billing: {
              name: `${user.username}`,
              phone: `${phone}`
            },
            line_items: [
              {
                name: `AGASPAY WATER BILL - ${user.username}`,
                amount: Math.round(amountToPay * 100),
                currency: "PHP",
                quantity: 1
              },
            ],
            payment_intent_id: paymentIntent.id,
            payment_method_types: [payment_method],
            success_url: `${baseUrl}/payment/success?payment_intent_id=${paymentIntent.id}&status=succeeded`,
            cancel_url: `${baseUrl}/payment/cancel?payment_intent_id=${paymentIntent.id}&status=failed`,
          },
        },
      },
      { headers }
    );

    const checkoutSession = checkoutResponse.data.data;

    // 🔹 Save PayMongo Payment Intent ID as reference (from Checkout Session)
    payment.payment_reference = checkoutSession.attributes.payment_intent.id; // so it get the paymentIntent.id used in checkout
    await payment.save(); 

    // 🔹 Respond to frontend
    res.status(200).json({
      success: true,
      msg: "Payment initialized",
      paymentId: payment._id,
      payment_reference: payment.payment_reference, // PayMongo intent ID
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

    // Populate bill_id -> connection_id -> resident_id
    const payments = await Payment.find({}).populate({
        path: "bill_id",
        populate: {
            path: "connection_id",
            populate: {
                path: "resident_id",
                select: "first_name last_name"
            }
        }
    });

    // Map payments to include only the desired fields
    const data = payments.map(payment => {
        const connection = payment.bill_id?.connection_id;
        const resident = connection?.resident_id;
        const fullName = resident ? `${resident.first_name} ${resident.last_name}` : null;

        return {
            payment_id: payment._id,
            amount_paid: payment.amount_paid,
            payment_method: payment.payment_method,
            payment_type: payment.payment_type,
            payment_status: payment.payment_status,
            official_receipt_status: payment.official_receipt_status,
            payment_date: payment.payment_date,
            createdAt: payment.createdAt,
            updatedAt: payment.updatedAt,
            residentFullName: fullName
        };
    });

    res.status(StatusCodes.OK).json(data);
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
