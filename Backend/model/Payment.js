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
    enum: ['gcash', 'paymaya'],
    required: true
  },

  payment_type: {
    type: String,
    enum: ['full', 'partial'],
    required: true
  },

  payment_status: {
    type: String,
    enum: ['pending', 'confirmed'],
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
  }

}, {
  timestamps: true,
  collection: 'payments'
});

module.exports = mongoose.model('Payment', PaymentSchema);
