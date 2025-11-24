const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  bill_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Billing',
    required: true
  },

  payment_date: {
    type: Date,
    default: Date.now
  },

  amount_paid: {
    type: Number,
    required: true,
    min: 0 
  },

  payment_method: {
    type: String,
    enum: ['gcash', 'paymaya', 'walk-in', 'cash'],
    required: true
  },

  payment_type: {
    type: String,
    enum: ['full', 'partial'],
    required: true
  },

  payment_status: {
    type: String,
    enum: ['pending', 'partially_paid', 'fully_paid', 'confirmed'],
    default: 'pending'
  },

  official_receipt_status: { 
    type: String,
    enum: ['temporary_receipt', 'official_receipt'],
    default: 'temporary_receipt'
  },

  payment_reference: { 
  type: String, // from PayMongo API response
  },

  confirmed_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // treasurer or system who confirmed the payment
    default: null // Optional - webhook payments don't need confirmation from a user
  },

  // ✅ Additional fields for walk-in/manual payments
  connection_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WaterConnection'
  },

  received_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // treasurer who received the payment
  }

}, {
  timestamps: true,
  collection: 'payments'
});

// ✅ CRITICAL: Enforce unique payment references to prevent duplicates from webhook retries
PaymentSchema.index({ payment_reference: 1 }, {
  unique: true,
  sparse: true,  // Allow null values (for manual payments without payment_reference)
  name: 'unique_payment_reference'
});

// ✅ Allow pending status - treasurer confirms payment later
// Payment status flow:
// 1. Online payments (webhook): pending (full) or partially_paid (partial) → confirmed (treasurer confirms)
// 2. Manual payments (walk-in): confirmed (treasurer already present and confirms immediately)

module.exports = mongoose.model('Payment', PaymentSchema);
