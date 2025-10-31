const mongoose = require('mongoose');

const AnnouncementSchema = new mongoose.Schema({
  title: { 
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  content: {
    type: String,
    required: [true, 'Content is required']
  },
  category: {
    type: String,
    enum: ['Maintenance', 'Event', 'Information', 'Billing', 'Alert'],
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high'],
    default: 'normal'
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
  },
  valid_until: {
    type: Date
  },
  views: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Announcement', AnnouncementSchema);
