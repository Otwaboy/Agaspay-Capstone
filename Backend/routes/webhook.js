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
    const type = event.data?.attributes?.type;
    const data = event.data?.attributes?.data;

    console.log("📥 Webhook received:", type);

    // Only process successful payments
    if (type !== "payment.paid" && type !== "checkout_session.payment.paid") {
      console.log("ℹ️ Ignoring event type:", type);
      return res.status(200).json({ success: true });
    }

    let billing;

    if (type === "payment.paid") {
      const paymentIntent = data?.attributes?.payment_intent?.id;
      if (!paymentIntent) {
        console.log("⚠️ No payment_intent found in webhook");
        return res.status(200).json({ success: true });
      }

      billing = await Billing.findOne({ current_payment_intent: paymentIntent });
    }

    if (type === "checkout_session.payment.paid") {
      const checkoutSessionId = data?.id;
      if (!checkoutSessionId) {
        console.log("⚠️ No checkout_session found in webhook");
        return res.status(200).json({ success: true });
      }

      billing = await Billing.findOne({ current_checkout_session: checkoutSessionId });
    }

    if (!billing) {
      console.log("⚠️ No billing found for this payment");
      return res.status(200).json({ success: true });
    }

    const amountPaid = billing.pending_amount || billing.total_amount;
    const isPartial = amountPaid < billing.total_amount;

    const paymentMethodUsed =
      data?.attributes?.payment_method_used ||
      data?.attributes?.payments?.[0]?.attributes?.source?.type ||
      "gcash";

    // Create payment record
    const payment = await Payment.create({
      bill_id: billing._id,
      amount_paid: amountPaid,
      payment_method: paymentMethodUsed,
      payment_type: isPartial ? "partial" : "full",
      payment_status: "pending",
      payment_reference: billing.current_payment_intent,
    });

    // Update billing
    billing.status = isPartial ? "partially_paid" : "paid";
    billing.amount_paid = (billing.amount_paid || 0) + amountPaid;
    billing.current_payment_intent = null;
    billing.current_checkout_session = null;
    billing.pending_amount = null;
    await billing.save();

    console.log("✅ Payment processed and billing updated:", payment._id, billing._id);

    res.status(200).json({ success: true, payment_id: payment._id, billing_id: billing._id });
  } catch (err) {
    console.error("❌ WEBHOOK ERROR:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;