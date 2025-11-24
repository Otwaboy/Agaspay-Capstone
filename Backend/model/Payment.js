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
    ref: 'User', // assuming treasurer accounts are in User collection
    required: function () {
      return this.payment_status === 'confirmed';
    }
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

// ✅ CRITICAL: Prevent "pending" status from ever being saved
PaymentSchema.pre('save', function(next) {
  if (this.payment_status === 'pending') {
    console.warn("⚠️ SECURITY: Attempted to save payment with 'pending' status. Defaulting to 'confirmed'.");
    this.payment_status = 'confirmed';
  }
  next();
});

// ✅ CRITICAL: Prevent "pending" status from ever being created
PaymentSchema.pre('insertOne', function(next) {
  if (this._doc?.payment_status === 'pending') {
    console.warn("⚠️ SECURITY: Attempted to create payment with 'pending' status. Forcing 'confirmed'.");
    this._doc.payment_status = 'confirmed';
  }
  next();
});

// ✅ CRITICAL: Catch-all for create operations
PaymentSchema.pre('create', function(next) {
  if (this.payment_status === 'pending') {
    console.warn("⚠️ SECURITY: Attempted to create payment with 'pending' status. Forcing 'confirmed'.");
    this.payment_status = 'confirmed';
  }
  next();
});

module.exports = mongoose.model('Payment', PaymentSchema);
