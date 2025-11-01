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
  total_amount: {
    type: Number,
     required: true
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
  }
}, {
  collection: 'Billing',
  timestamps: true
});


BillingSchema.pre('save', async function(next) {
  const reading = await mongoose.model('MeterReading').findById(this.reading_id);
  const rate = await mongoose.model('Rate').findById(this.rate_id);

  if (reading && rate) {
    this.total_amount = reading.calculated * rate.amount;
  }
  next();
})





module.exports = mongoose.model('Billing', BillingSchema);



