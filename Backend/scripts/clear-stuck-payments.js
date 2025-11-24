/**
 * Utility Script: Clear Stuck Payment Intents
 *
 * Sometimes if a webhook doesn't fire or is delayed, payment intents
 * can be left in a "pending" state, blocking new payments.
 *
 * This script safely clears them so payments can be retried.
 *
 * Usage: node scripts/clear-stuck-payments.js
 */

require("dotenv").config();
const mongoose = require("mongoose");
const Billing = require("../model/Billing");

async function clearStuckPayments() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB");

    // Find all billings with stuck payment intents
    const billingsWithIntent = await Billing.find({
      current_payment_intent: { $ne: null }
    });

    if (billingsWithIntent.length === 0) {
      console.log("✅ No stuck payment intents found!");
      process.exit(0);
    }

    console.log(`\n🔍 Found ${billingsWithIntent.length} billing(s) with stuck payment intents:`);
    billingsWithIntent.forEach(b => {
      console.log(`  - Bill ID: ${b._id}`);
      console.log(`    Payment Intent: ${b.current_payment_intent}`);
      console.log(`    Status: ${b.status}`);
      console.log(`    Amount Paid: ${b.amount_paid}`);
    });

    // Clear all stuck intents
    console.log(`\n🧹 Clearing stuck payment intents...`);
    const result = await Billing.updateMany(
      { current_payment_intent: { $ne: null } },
      {
        current_payment_intent: null,
        pending_amount: null
      }
    );

    console.log(`✅ Cleared ${result.modifiedCount} billing record(s)`);
    console.log(`\n✅ Users can now retry payments!`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error(error);
    process.exit(1);
  }
}

clearStuckPayments();
