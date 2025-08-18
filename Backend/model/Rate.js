const mongoose = require('mongoose');

const RateSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
  },
  effective_date: { 
    type: Date,
    required: true,
  },
  rate_status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'inactive',
  }
}, {
  collection: 'Rates',
  timestamps: true
});

module.exports = mongoose.model('Rate', RateSchema);
