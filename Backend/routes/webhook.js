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

    // CRITICAL: Check if payment has already been recorded in our system
    // The duplicate prevention at the Payment level (line 61-66) is sufficient
    // No need for additional billing-level duplicate check here

    const amountPaid = billing.pending_amount || billing.total_amount;
    const previousAmountPaid = billing.amount_paid || 0;
    const newAmountPaid = previousAmountPaid + amountPaid;
    const newBalance = billing.total_amount - newAmountPaid;

    console.log("💰 [Webhook] Processing payment - Total:", billing.total_amount, "Previous Paid:", previousAmountPaid, "Amount to pay:", amountPaid, "New Total Paid:", newAmountPaid, "New Balance:", newBalance);

    const paymentMethodUsed =
      data?.attributes?.payment_method_used ||
      data?.attributes?.payments?.[0]?.attributes?.source?.type ||
      "gcash";

    // Determine payment type and billing status based on remaining balance
    let payment_type;
    let new_billing_status;
    let payment_status; // Payment status for the Payment record

    if (newBalance === 0) {
      // Full payment: automatically mark as confirmed since bill is fully paid
      payment_type = 'full';
      new_billing_status = 'paid';
      payment_status = 'confirmed';
    } else {
      // Partial payment: keep as pending, only treasurer can confirm
      payment_type = 'partial';
      new_billing_status = 'partial';
      payment_status = 'pending'; // Treasurer must confirm partial payments
    }

    // Create payment record
    const payment = await Payment.create({
      bill_id: billing._id,
      amount_paid: amountPaid,
      payment_method: paymentMethodUsed,
      payment_type: payment_type,
      payment_status: payment_status, // Partial payments are 'pending' until treasurer confirms
      payment_reference: paymentReference,
    });

    // Update billing
    const oldStatus = billing.status;
    const oldAmountPaid = billing.amount_paid;
    billing.status = new_billing_status;
    billing.amount_paid = newAmountPaid;
    billing.balance = newBalance;
    billing.current_payment_intent = null;
    billing.current_checkout_session = null;
    billing.pending_amount = null;
    await billing.save();

    // ✅ If bill is fully paid, mark all bills included in its previous_balance as paid
    // This implements cascade payment logic for online payments (same as manual payments)
    if (newBalance === 0 && billing.previous_balance > 0) {
      const olderBills = await Billing.find({
        connection_id: billing.connection_id,
        status: { $in: ['unpaid', 'partial', 'consolidated'] },
        generated_at: { $lt: billing.generated_at }
      }).sort({ generated_at: -1 });

      if (olderBills.length > 0) {
        await Billing.updateMany(
          {
            connection_id: billing.connection_id,
            status: { $in: ['unpaid', 'partial', 'consolidated'] },
            generated_at: { $lt: billing.generated_at }
          },
          { $set: { status: 'paid' } }
        );
        console.log(`✅ [Webhook] Marked ${olderBills.length} older bills as paid because they're included in this bill's previous_balance`);
      }
    }

    console.log("✅ [Webhook] Payment processed and billing updated:");
    console.log("   - Status: %s → %s", oldStatus, billing.status);
    console.log("   - Amount Paid: %d → %d", oldAmountPaid, billing.amount_paid);
    console.log("   - Balance: %d", newBalance);
    console.log("   - Payment ID:", payment._id);
    console.log("   - Billing ID:", billing._id);

    res.status(200).json({ success: true, payment_id: payment._id, billing_id: billing._id });
  } catch (err) {
    console.error("❌ WEBHOOK ERROR:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;