// routes/webhook.js
const express = require("express");
const router = express.Router();
const Payment = require("../model/Payment");
const Billing = require("../model/Billing");

//So instead of you constantly polling (asking PayMongo every few seconds “is it paid yet?”), PayMongo will push the update to your webhook URL in real time.
router.post("/", async (req, res) => {
  try {
    const event = req.body;

    console.log("🔔 Webhook received:", JSON.stringify(event, null, 2));

    const type = event.data?.attributes?.type;
    const data = event.data?.attributes?.data;

    // Extract payment reference ID depending on event type
    let paymentReference = null;
    if (type === "payment.paid") {
      paymentReference = data?.id;
    } else if (type === "checkout_session.payment.paid") {
      paymentReference = data?.attributes?.payment_intent?.id;
    }

    if (!paymentReference) {
      console.log("⚠️ Could not find payment reference in event");
      return res.status(200).json({ success: true });
    }

    console.log(`✅ Payment reference: ${paymentReference}, Event type: ${type}`);

    // Find payment record
    const payment = await Payment.findOne({ payment_reference: paymentReference });
    if (payment) {
      // Update Payment status
      payment.payment_status = "pending";
      await payment.save();

      // Update Billing status
      await Billing.findByIdAndUpdate(payment.bill_id, { status: "paid" });

      console.log(`💰 Payment ${paymentReference} and Billing ${payment.bill_id} marked as PAID`);
    } else {
      console.log(`⚠️ Payment with reference ${paymentReference} not found in database`);
    }

    // Respond immediately to avoid retries
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("⚠️ Webhook error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
