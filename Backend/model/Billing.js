const mongoose = require('mongoose');

const BillingSchema = new mongoose.Schema({

  // Link to the water connection (resident) this bill belongs to
  connection_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WaterConnection',
    required: true
  },

  // Link to the meter reading used to calculate this bill's charges
  reading_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MeterReading',
    required: true
  },

  // Link to the rate table used to calculate charges from meter reading
  rate_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Rate',
  },

  // Unpaid amount from previous bills (for cumulative billing system)
  previous_balance: {
    type: Number,
    default: 0,
    comment: 'Sum of all unpaid bills before this one'
  },

  // Water consumption charges for current month only
  current_charges: {
    type: Number,
    required: true,
    comment: 'Current month water consumption charges'
  },

  // Total bill amount (previous_balance + current_charges)
  total_amount: {
    type: Number,
    required: true,
    comment: 'previous_balance + current_charges'
  },

  // Bill payment status (unpaid, paid, partial, overdue, consolidated)
  status: {
    type: String,
    enum: ['unpaid', 'paid', 'partial', 'overdue', 'consolidated'],
    default: 'unpaid'
  },

  // Date when bill payment is due
  due_date: {
    type: Date,
    required: true
  },

  // Timestamp when this bill was created
  generated_at: {
    type: Date,
    default: Date.now
  },

  // Staff member who created this bill
  generated_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Personnel',
    required: true
  },

  // // Flag if this connection is marked for disconnection due to unpaid bills
  // marked_for_disconnection: {
  //   type: Boolean,
  //   default: false
  // },




  // PayMongo payment intent ID for online payment processing
  current_payment_intent: {
    type: String,
    default: null,
  },

  // PayMongo checkout session ID for tracking online payment
  current_checkout_session: {
    type: String,
    default: null
  },

  // Amount being paid in current online payment session (temporary, cleared after webhook)
  pending_amount: {
    type: Number,
    default: 0,
  },

  // Total amount paid towards this bill (from manual or online payments)
  amount_paid: {
    type: Number,
    default: 0,
    comment: 'Total amount paid so far for this bill'
  },

  // Remaining amount still owed on this bill (total_amount - amount_paid)
  balance: {
    type: Number,
    default: function() {
      return this.total_amount - (this.amount_paid || 0);
    },
    comment: 'Remaining amount to be paid (total_amount - amount_paid)'
  }
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



