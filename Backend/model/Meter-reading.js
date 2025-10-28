const mongoose = require('mongoose');

const MeterReadingSchema = new mongoose.Schema({
  connection_id: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'WaterConnection',
    required: true
  },
  inclusive_date: {
    start: { type: Date, required: true },
    end: { type: Date, required: true }
  },
  previous_reading: {
    type: Number,
    min: [0, 'Previous reading cannot be negative']
  },
  present_reading: {
    type: Number,
    required: [true, 'Present reading is required'],
    min: [0, 'Present reading cannot be negative'],
    validate: {
      validator: function (value) {
        // prevent present < previous
        return value >= this.previous_reading;
      },
      message: 'Present reading must be greater than or equal to previous reading'
    }
  },
  calculated: {
    type: Number,
    default: 0
  },
  remarks: {
    type: String, 
    default: "Normal Reading"
  },
  reading_status: {
    type: String,
    enum: ['inprogress', 'submitted', 'approved'],
    default: 'inprogress'
  },
  monthly_status: {
    type: String,
    enum: ['pending', 'completed'],
    default: 'pending'
  },
  reading_period: {
    month: { type: Number, required: true },
    year: { type: Number, required: true }
  },
  can_edit: {
    type: Boolean,
    default: true
  },
  recorded_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Personnel',
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

// 🔹 Always recalc "calculated" before saving
MeterReadingSchema.pre("save", function (next) {
  this.calculated = this.present_reading - this.previous_reading;
  next();
});

module.exports = mongoose.model('MeterReading', MeterReadingSchema);
