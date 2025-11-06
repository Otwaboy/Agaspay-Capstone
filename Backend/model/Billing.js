const mongoose = require('mongoose');

const BillingSchema = new mongoose.Schema({
   
  connection_id: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'WaterConnection',
    required: true
  },
  reading_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MeterReading',
    required: true
  },  
  rate_id: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Rate',  
  },
  previous_balance: {
    type: Number,
    default: 0,
    comment: 'Sum of all unpaid bills before this one'
  },
  current_charges: {
    type: Number,
    required: true,
    comment: 'Current month water consumption charges'
  },
  total_amount: {
    type: Number,
    required: true,
    comment: 'previous_balance + current_charges'
  },
  status: {
    type: String,
    enum: ['unpaid', 'paid', 'partial', 'overdue'],
    default: 'unpaid'
  },
  due_date: {
    type: Date,
    required: true
  },
  generated_at: {
    type: Date,
    default: Date.now
  }, 
  generated_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Personnel', // assuming your personnel collection/model name
    required: true
  },
  consecutive_unpaid_months: {
    type: Number,
    default: 0
  },
  is_delinquent: {
    type: Boolean,
    default: false
  },
  marked_for_disconnection: {
    type: Boolean,
    default: false
  },
  current_payment_intent: {
  type: String,
  default: null,
  },
current_checkout_session: {
  type: String,
  default: null 
  },
  pending_amount: {
  type: Number,
  default: 0,
},
}, {
  collection: 'Billing',
  timestamps: true
});


BillingSchema.pre('save', async function(next) {
  // ✅ Only calculate if values are not already set (for backward compatibility)
  if (!this.current_charges && !this.previous_balance) {
    const reading = await mongoose.model('MeterReading').findById(this.reading_id);
    const rate = await mongoose.model('Rate').findById(this.rate_id);

    if (reading && rate) {
      // Old behavior: simple calculation without cumulative billing
      this.current_charges = reading.calculated * rate.amount;
      this.previous_balance = 0;
      this.total_amount = this.current_charges;
    }
  } else {
    // ✅ New behavior: preserve cumulative calculation from controller
    // Ensure total_amount = previous_balance + current_charges
    if (this.previous_balance !== undefined && this.current_charges !== undefined) {
      this.total_amount = this.previous_balance + this.current_charges;
    }
  }
  next();
})





module.exports = mongoose.model('Billing', BillingSchema);



