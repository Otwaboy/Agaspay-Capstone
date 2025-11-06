// routes/webhook.js
const express = require("express");
const router = express.Router();
const Payment = require("../model/Payment");
const Billing = require("../model/Billing");

//So instead of you constantly polling (asking PayMongo every few seconds “is it paid yet?”), PayMongo will push the update to your webhook URL in real time.
router.post("/", async (req, res) => {
  try {
    const event = req.body;
    const type = event.data?.attributes?.type;
    const data = event.data?.attributes?.data;

    if (type !== "payment.paid" && type !== "checkout_session.payment.paid") {
      return res.status(200).json({ success: true });
    }

    const paymentIntent = data?.attributes?.payment_intent?.id;
    if (!paymentIntent) return res.status(200).json({ success: true });

    console.log("✅ Payment confirmed:", paymentIntent);

    // Look up billing via metadata (YOU MUST ADD THIS IN PAYINTENT LATER)
    const billing = await Billing.findOne({ current_payment_intent: paymentIntent });
    if (!billing) return res.status(200).json({ success: true });

    const amountPaid = billing.total_amount; // or get from event if needed
    const isPartial = false; // Update if needed

    // ✅ Now create payment record
    await Payment.create({
      bill_id: billing._id,
      amount_paid: amountPaid,
      payment_method: "gcash",
      payment_type: isPartial ? "partial" : "full",
      payment_status: isPartial ? "partially_paid" : "fully_paid",
      payment_reference: paymentIntent
    });

    // ✅ Update billing status
    billing.status = "paid";
    await billing.save();

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error("WEBHOOK ERROR:", err.message);
    res.status(500).json({ success: false });
  }
});


module.exports = router;
