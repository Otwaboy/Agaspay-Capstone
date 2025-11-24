/**
 * Cleanup Script: Remove Duplicate Payment Records
 *
 * This script removes:
 * 1. All payment records with payment_status: "pending"
 * 2. Duplicate payment records with the same payment_reference (keeps only the first one)
 *
 * Usage: node scripts/cleanup-duplicate-payments.js
 */

require("dotenv").config();
const mongoose = require("mongoose");
const Payment = require("../model/Payment");
const Billing = require("../model/Billing");

async function cleanupDuplicatePayments() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB");

    // Step 1: Find all payments with "pending" status
    console.log("\n🔍 Step 1: Finding payments with status 'pending'...");
    const pendingPayments = await Payment.find({
      payment_status: "pending",
    });
    console.log(`Found ${pendingPayments.length} payments with 'pending' status`);

    if (pendingPayments.length > 0) {
      console.log("Sample payment records with 'pending' status:");
      pendingPayments.slice(0, 3).forEach((p) => {
        console.log(`  - ID: ${p._id}, Ref: ${p.payment_reference}, Created: ${p.createdAt}`);
      });

      const deletedPending = await Payment.deleteMany({
        payment_status: "pending",
      });
      console.log(`✅ Deleted ${deletedPending.deletedCount} pending payments`);
    }

    // Step 2: Find duplicate payment_reference entries
    console.log("\n🔍 Step 2: Finding duplicate payment_reference entries...");
    const duplicateRefs = await Payment.aggregate([
      {
        $match: {
          payment_reference: { $ne: null },
        },
      },
      {
        $group: {
          _id: "$payment_reference",
          count: { $sum: 1 },
          ids: { $push: "$_id" },
          createdDates: { $push: "$createdAt" },
        },
      },
      {
        $match: {
          count: { $gt: 1 },
        },
      },
    ]);

    console.log(`Found ${duplicateRefs.length} duplicate payment references`);

    if (duplicateRefs.length > 0) {
      console.log("Sample duplicates:");
      duplicateRefs.slice(0, 3).forEach((dup) => {
        console.log(
          `  - Reference: ${dup._id}, Count: ${dup.count}, IDs: ${dup.ids.join(", ")}`
        );
      });

      let totalDuplatesDeleted = 0;

      // Delete duplicates, keeping only the first one
      for (const dupRef of duplicateRefs) {
        const idsToKeep = [dupRef.ids[0]]; // Keep the first one
        const idsToDelete = dupRef.ids.slice(1); // Delete the rest

        const deleteResult = await Payment.deleteMany({
          _id: { $in: idsToDelete },
        });

        totalDuplatesDeleted += deleteResult.deletedCount;
        console.log(
          `  - Reference ${dupRef._id}: Deleted ${deleteResult.deletedCount} duplicates`
        );
      }

      console.log(`✅ Total duplicate payments deleted: ${totalDuplatesDeleted}`);
    }

    // Step 3: Verify billing amounts are consistent
    console.log("\n🔍 Step 3: Verifying billing consistency...");
    const allPayments = await Payment.aggregate([
      {
        $group: {
          _id: "$bill_id",
          totalPaid: { $sum: "$amount_paid" },
          paymentCount: { $sum: 1 },
        },
      },
    ]);

    console.log(`Found ${allPayments.length} bills with payments`);

    let inconsistencies = 0;
    for (const billPayment of allPayments.slice(0, 10)) {
      // Check first 10 only to avoid too much output
      const billing = await Billing.findById(billPayment._id);
      if (billing) {
        if (
          Math.abs(
            billing.amount_paid - billPayment.totalPaid
          ) > 0.01
        ) {
          console.log(
            `⚠️  Inconsistency for bill ${billing._id}: DB amount_paid=${billing.amount_paid}, Sum of payments=${billPayment.totalPaid}`
          );
          inconsistencies++;
        }
      }
    }

    if (inconsistencies === 0) {
      console.log("✅ No amount inconsistencies found in sampled bills");
    }

    // Step 4: Create database indexes
    console.log("\n🔍 Step 4: Creating database indexes...");
    try {
      await Payment.collection.createIndex(
        { payment_reference: 1 },
        { unique: true, sparse: true, name: "unique_payment_reference" }
      );
      console.log("✅ Created unique index on payment_reference");
    } catch (err) {
      if (err.code === 68) {
        console.log("ℹ️  Index already exists");
      } else {
        console.error("❌ Error creating index:", err.message);
      }
    }

    console.log("\n✅ Cleanup completed successfully!");

    const finalCount = await Payment.countDocuments();
    console.log(`📊 Final payment record count: ${finalCount}`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error during cleanup:", error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run the cleanup
cleanupDuplicatePayments();
