const mongoose = require('mongoose');

const WaterScheduleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  description: {
    type: String
  },
  service_area: {
    type: String,
    enum: ['Biking 1', 'Biking 2', 'Biking 3', 'All'],
    required: true
  },
  puroks: {
    type: [String],
    enum: ["1", "2", "3", "4", "5", "6", "7"],
    required: true
  },
  start_time: {
    type: String,
    required: true
  },
  end_time: {
    type: String,
    required: true
  },
  effective_date: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'pending_approval', 'approved', 'published', 'archived'],
    default: 'draft'
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Personnel',
    required: true
  },
  approved_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Personnel'
  },
  approval_date: {
    type: Date
  },
  published_date: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('WaterSchedule', WaterScheduleSchema);
