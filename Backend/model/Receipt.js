const mongoose = require('mongoose');

const ReceiptSchema = new mongoose.Schema({
  receipt_number: {
    type: String,
    required: true,
    unique: true
  },
  payment_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment',
    required: true
  },
  bill_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Billing',
    required: true
  },
  resident_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resident',
    required: true
  },
  receipt_type: {
    type: String,
    enum: ['temporary', 'official'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  payment_method: {
    type: String,
    required: true
  },
  issued_date: {
    type: Date,
    default: Date.now
  },
  issued_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Personnel'
  }
}, {
  timestamps: true
});


// Auto-generate receipt numbers
ReceiptSchema.pre('save', async function(next) {
  if (!this.receipt_number) {
    const prefix = this.receipt_type === 'temporary' ? 'TMP' : 'OR';
    const count = await mongoose.model('Receipt').countDocuments();
    this.receipt_number = `${prefix}-${new Date().getFullYear()}-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Receipt', ReceiptSchema);
