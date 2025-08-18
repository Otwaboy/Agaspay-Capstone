const mongoose = require('mongoose');

const MeterReadingSchema = new mongoose.Schema({
  connection_id: 
  {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'WaterConnection',
    required: true
  },
  inclusive_date: {
    type: String,
    required: [true, 'Inclusive date (billing period) is required']

  },
  
  previous_reading: 
  {
    type: Number,
    required: [true, 'Previous reading is required'],
    min: [0, 'Previous reading cannot be negative']
  },
  present_reading: 
  {
    type: Number,
    required: [true, 'Present reading is required'],
    min: [0, 'Present reading cannot be negative'],
    validate: {
      validator: function (value) {
        return value >= this.previous_reading;
      },
      message: 'Present reading must be greater than or equal to previous reading'
    }
  },
  calculated: 
  {
    type: Number,
    required: true,
    default: function () {
      return this.present_reading - this.previous_reading;
    }
  },
  remarks: 
  {
    type: String, 
    default: "Normal Reading"
  },
  reading_status: 
  {
    type: String,
    enum: ['inprogress', 'submitted', 'approved'],
    default: 'inprogress'
  },
  recorded_by: 
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Personnel',
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('MeterReading', MeterReadingSchema);
