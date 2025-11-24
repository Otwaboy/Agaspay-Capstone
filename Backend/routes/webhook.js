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
    console.log("🔔 ============================================");
    console.log("🔔 WEBHOOK REQUEST RECEIVED!");
    console.log("🔔 Timestamp:", new Date().toISOString());
    console.log("🔔 Request Headers:", req.headers);
    console.log("🔔 Request Body (raw):", JSON.stringify(req.body, null, 2));
    console.log("🔔 ============================================");

    const event = req.body;
    const type = event.data?.attributes?.type;
    const data = event.data?.attributes?.data;

    console.log("📥 Webhook event type:", type);
    console.log("📥 Webhook data:", data);

    // Only process successful payments
    if (type !== "payment.paid" && type !== "checkout_session.payment.paid") {
      console.log("ℹ️ Ignoring event type:", type);
      return res.status(200).json({ success: true });
    }

    let billing;
    let paymentReference;

    if (type === "payment.paid") {
      // ⚠️ IMPORTANT: payment.paid webhook has payment_intent_id, but it might differ from what we saved
      // Don't use it for lookup - instead wait for checkout_session.payment.paid which has the checkout_session ID
      console.log("ℹ️  [Webhook] payment.paid received - waiting for checkout_session webhook to process");
      return res.status(200).json({ success: true });
    }

    if (type === "checkout_session.payment.paid") {
      // ✅ CRITICAL FIX: Use checkout_session ID which matches what we saved in billing
      const checkoutSessionId = data?.id;
      if (!checkoutSessionId) {
        console.log("⚠️ No checkout_session ID found in webhook");
        return res.status(200).json({ success: true });
      }

      console.log("📌 [Webhook] checkout_session.payment.paid using checkout_session ID:", checkoutSessionId);
      paymentReference = data?.payment_intent?.id || "checkout_" + checkoutSessionId;
      billing = await Billing.findOne({ current_checkout_session: checkoutSessionId });
    }

    if (!billing) {
      console.log("⚠️ No billing found for this payment");
      return res.status(200).json({ success: true });
    }

    // Check if payment for this reference already exists (prevent duplicates)
    const existingPayment = await Payment.findOne({ payment_reference: paymentReference });
    if (existingPayment) {
      console.log("⚠️ Payment already processed for this reference:", paymentReference);
      console.log("⚠️ Existing payment status:", existingPayment.payment_status);
      return res.status(200).json({ success: true, message: "Payment already processed" });
    }

    // CRITICAL: Check if this exact bill is already being processed by another webhook
    const pendingBillingUpdate = await Billing.findOne({
      _id: billing._id,
      current_payment_intent: null  // If null, another webhook already processed it
    });
    if (!pendingBillingUpdate) {
      console.log("⚠️ Billing already updated by another webhook. Skipping duplicate.");
      return res.status(200).json({ success: true, message: "Billing already updated" });
    }

    const amountPaid = billing.pending_amount || billing.total_amount;
    const isPartial = amountPaid < billing.total_amount;

    console.log("💰 [Webhook] Processing payment - Total:", billing.total_amount, "Pending:", billing.pending_amount, "Amount to pay:", amountPaid, "Is Partial:", isPartial);

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
      payment_status: "confirmed",
      payment_reference: paymentReference,
    });

    // Update billing
    const oldStatus = billing.status;
    const oldAmountPaid = billing.amount_paid;
    billing.status = isPartial ? "partial" : "paid";
    billing.amount_paid = (billing.amount_paid || 0) + amountPaid;
    billing.current_payment_intent = null;
    billing.current_checkout_session = null;
    billing.pending_amount = null;
    await billing.save();

    console.log("✅ [Webhook] Payment processed and billing updated:");
    console.log("   - Status: %s → %s", oldStatus, billing.status);
    console.log("   - Amount Paid: %d → %d", oldAmountPaid, billing.amount_paid);
    console.log("   - Balance: %d", billing.total_amount - billing.amount_paid);
    console.log("   - Payment ID:", payment._id);
    console.log("   - Billing ID:", billing._id);

    res.status(200).json({ success: true, payment_id: payment._id, billing_id: billing._id });
  } catch (err) {
    console.error("❌ WEBHOOK ERROR:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;