require('dotenv').config();
const mongoose = require('mongoose');
const Billing = require('./model/Billing');
const Payment = require('./model/Payment');

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all bills with details
    const billings = await Billing.find().select('_id status amount_paid total_amount current_payment_intent pending_amount createdAt').limit(5);

    console.log('📋 Current Billing Records:');
    billings.forEach(b => {
      console.log(`\n  Bill ID: ${b._id}`);
      console.log(`  Status: ${b.status}`);
      console.log(`  Amount Paid: ${b.amount_paid}/${b.total_amount} PHP`);
      console.log(`  Current Payment Intent: ${b.current_payment_intent || 'None'}`);
      console.log(`  Pending Amount: ${b.pending_amount || 'None'}`);
    });

    // Get payment count
    const paymentCount = await Payment.countDocuments();
    console.log(`\n📊 Total Payment Records: ${paymentCount}`);

    // Get recent payments
    const recentPayments = await Payment.find().sort({ createdAt: -1 }).limit(3).select('_id payment_reference payment_status amount_paid createdAt');
    console.log('\n💳 Recent Payment Records:');
    recentPayments.forEach(p => {
      console.log(`  - Ref: ${p.payment_reference}, Status: ${p.payment_status}, Amount: ${p.amount_paid}, Created: ${p.createdAt}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
})();
