// routes/webhook.js
const express = require("express");
const router = express.Router();
const Payment = require("../model/Payment");
const Billing = require("../model/Billing");

// PayMongo Webhook Handler
// This receives real-time payment notifications from PayMongo
// Instead of constantly polling PayMongo, they push updates to this endpoint
router.post("/", async (req, res) => {
  try {
    const event = req.body;
    const type = event.data?.attributes?.type; // get the checkout_session.payment.paid webhook event sa paymongo 
    const data = event.data?.attributes?.data; // getting the data or the information or data of the user

    console.log("📥 Webhook received:", type);



    let paymentIntentId = null;
    // 🔹 Only process payment success events
   // payment.paid event
    if (type === "payment.paid") {
      paymentIntentId = data?.attributes?.payment_intent?.id;
    }

    // checkout_session.payment.paid event
    if (type === "checkout_session.payment.paid") {
      paymentIntentId = data?.attributes?.payment_intent?.id;
    }

      if (!paymentIntentId) {
    console.log("⚠️ No payment_intent found in webhook");
    return res.status(200).json({ success: true });
  }

  
    // 🔹 Extract payment_intent_id from the webhook payload
    const paymentIntent = data?.attributes?.payment_intent?.id 
  || data?.attributes?.payments?.[0]?.attributes?.payment_intent_id;
    
    if (!paymentIntent) {
      console.log("⚠️ No payment_intent found in webhook");
      return res.status(200).json({ success: true });
    }

    console.log("✅ Payment confirmed:", paymentIntent);

    // 🔹 Check if payment already recorded (prevent duplicates)
    const existingPayment = await Payment.findOne({ 
      payment_reference: paymentIntent 
    });

    if (existingPayment) {
      console.log("⚠️ Payment already recorded:", paymentIntent);
      return res.status(200).json({ 
        success: true, 
        msg: "Already processed" 
      });
    }

    // 🔹 Look up billing via current_payment_intent
    // This was set in the payPayment controller when payment was initiated
    const billing = await Billing.findOne({ 
      current_payment_intent: paymentIntent 
    });
    
    if (!billing) {
      console.log("⚠️ No billing found for payment_intent:", paymentIntent);
      return res.status(200).json({ success: true });
    }

    console.log("📋 Found billing record:", billing._id);

    // 🔹 Get amount from billing.pending_amount (set during payment initialization)
    const amountPaid = billing.pending_amount || billing.total_amount;
    const isPartial = amountPaid < billing.total_amount;

    // 🔹 Get payment method from PayMongo event data
    const paymentMethodUsed = data?.attributes?.payment_method_used || 
                              data?.attributes?.payments?.[0]?.attributes?.source?.type || 
                              "gcash";

    console.log("💰 Amount paid:", amountPaid, "Method:", paymentMethodUsed);

    // ✅ NOW create payment record (ONLY AFTER SUCCESSFUL PAYMENT)
    const payment = await Payment.create({
      bill_id: billing._id,
      amount_paid: amountPaid,
      payment_method: paymentMethodUsed,
      payment_type: isPartial ? "partial" : "full",
      payment_status: "pending",
      payment_reference: paymentIntent
    });

    console.log("💾 Payment record created:", payment._id);

    // ✅ Update billing status
    billing.status = isPartial ? "partial" : "paid";
    billing.amount_paid = (billing.amount_paid || 0) + amountPaid;
    
    // 🔹 Clear temporary fields
    billing.current_payment_intent = null;
    billing.pending_amount = null;
    
    await billing.save();

    console.log("✅ Billing updated:", billing._id, "Status:", billing.status);

    return res.status(200).json({ 
      success: true, 
      msg: "Payment processed successfully",
      payment_id: payment._id,
      billing_id: billing._id
    });

  } catch (err) {
    console.error("❌ WEBHOOK ERROR:", err.message);
    console.error(err);
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
});

module.exports = router;