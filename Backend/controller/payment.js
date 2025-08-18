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
  const user = req.user;
  const { bill_id, payment_method, amount } = req.body; 
  // ✅ amount is optional (manual input for testing)

  const billing = await Billing.findById(bill_id); 
  if (!billing) {
    throw new BadRequestError("Billing not found");
  }

  if (billing.status !== 'unpaid') {
    throw new BadRequestError("Bill is already paid or not payable");
  }

  // ✅ If user provides custom amount, use it, else fallback to billing.total_amount
  const amountToPay = amount ?? billing.total_amount;

  const payment = await Payment.create({
    bill_id,
    amount_paid: amountToPay,
    payment_method,
    payment_type: amountToPay < billing.total_amount ? 'partial' : 'full',
    payment_status: 'pending'
  });

  // ✅ Create PaymentIntent in PayMongo
  const response = await axios.post(
    "https://api.paymongo.com/v1/payment_intents",
    {
      data: {
        attributes: {
          amount: amountToPay * 100, // PayMongo expects cents
          currency: "PHP",
          payment_method_allowed: ["gcash", "paymaya"],
          capture_type: "automatic"
        }
      }
    },
    {
      headers: {
        Authorization: `Basic ${Buffer.from(stripe + ":").toString("base64")}`,
        "Content-Type": "application/json"
      }
    }
  );

  const paymentIntent = response.data.data;

  const checkoutRes = await axios.post(
    "https://api.paymongo.com/v1/checkout_sessions",
    {
      data: {
        attributes: {
          line_items: [
            {
              name: `Water Bill - ${user.username}`,
              amount: amountToPay * 100,
              currency: "PHP",
              quantity: 1
            }
          ],
          payment_intent: paymentIntent.id,
          payment_method_types: [payment_method],
          success_url: "https://yourdomain.com/payment/success",
          cancel_url: "https://yourdomain.com/payment/cancel"
        }
      }
    },
    {
      headers: {
        Authorization: `Basic ${Buffer.from(stripe + ":").toString("base64")}`,
        "Content-Type": "application/json"
      }
    }
  );

  const checkoutUrl = checkoutRes.data.data.attributes.checkout_url;

  res.status(StatusCodes.OK).json({
    msg: "Payment initialized",
    paymentId: payment._id,
    payment_method: payment.payment_method,
    payment_type: payment.payment_status,
    checkoutUrl
  });
};


module.exports = { payPayment };
