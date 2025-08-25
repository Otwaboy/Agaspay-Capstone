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

    // Validate required fields
    if (!bill_id || !payment_method) {
      return res.status(400).json({
        success: false,
        message: "bill_id and payment_method are required"
      });
    }

    // Validate PayMongo secret key
    if (!process.env.PAYMONGO_SECRET_KEY) {
      return res.status(500).json({
        success: false,
        message: "PAYMONGO_SECRET_KEY not found in environment variables"
      });
    }


    const billing = await Billing.findById(bill_id); 
    if (!billing) {
      return res.status(404).json({
        success: false,
        message: "Billing record not found"
      });
    }

    const amountToPay = amount ?? billing.total_amount;

    const payment = await Payment.create({
      bill_id,
      amount_paid: amountToPay,
      payment_method,
      payment_type: amountToPay < billing.total_amount ? 'partial' : 'full',
      payment_status: 'pending'
    });

    // ✅ CORRECT PayMongo Authorization
    const paymongoAuth = Buffer.from(process.env.PAYMONGO_SECRET_KEY + ":").toString("base64");
    const headers = {
      Authorization: `Basic ${paymongoAuth}`,
      "Content-Type": "application/json"
    };

    // Create payment intent
    const paymentIntentResponse = await axios.post(
      "https://api.paymongo.com/v1/payment_intents",
      {
        data: {
          attributes: {
            amount: Math.round(amountToPay * 100),
            currency: "PHP",
            payment_method_allowed: ["gcash", "paymaya"],
            capture_type: "automatic"
          }
        }
      },
      { headers }
    );

    const paymentIntent = paymentIntentResponse.data.data;

    // ✅ CORRECT URLs for your frontend
    const baseUrl = req.headers.origin || 'http://localhost:5173';

    // Create checkout session
    const checkoutResponse = await axios.post(
      "https://api.paymongo.com/v1/checkout_sessions",
      {
        data: {
          attributes: {
            line_items: [
              {
                name: `Water Bill - ${user.username}`,
                amount: Math.round(amountToPay * 100),
                currency: "PHP",
                quantity: 1
              }
            ],
            payment_intent_id: paymentIntent.id,
            payment_method_types: [payment_method],
            success_url: `${baseUrl}/payment/success?payment_intent_id=${paymentIntent.id}&status=succeeded`,
            cancel_url: `${baseUrl}/payment/cancel?payment_intent_id=${paymentIntent.id}&status=failed`
          }
        }
      },
      { headers }
    );

    const checkoutUrl = checkoutResponse.data.data.attributes.checkout_url;

    res.status(200).json({
      success: true,
      msg: "Payment initialized",
      paymentId: payment._id,
      payment_intent_id: paymentIntent.id,
      payment_method: payment.payment_method,
      payment_type: payment.payment_type,
      checkoutUrl
    });

  } catch (error) {
    console.error('PayMongo Error:', error.response?.data || error.message);
    
    // Handle PayMongo API errors
    if (error.response?.data) {
      return res.status(400).json({
        success: false,
        message: "PayMongo API Error",
        error: error.response.data
      });
    }

    res.status(500).json({
      success: false,
      message: "Payment processing failed",
      error: error.message
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
            paymnent_id: payment._id,
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
