require("dotenv").config();
const axios = require('axios');
const Stripe = require("stripe");
const { StatusCodes } = require('http-status-codes');
const { BadRequestError } = require('../errors');
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

module.exports = { payPayment };
