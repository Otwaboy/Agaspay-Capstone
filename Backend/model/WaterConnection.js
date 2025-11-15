const mongoose = require('mongoose');

const WaterConnectionSchema = new mongoose.Schema({
     
  resident_id: 
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resident',
    required: true
  },
  meter_no:  
  {
    type: String, 
    required: [true, 'Meter number is required'],
    unique: true
  },
  connection_status: 
  {
    type: String,
    enum: ['pending', 'active', 'for_disconnection', 'scheduled_for_disconnection', 'disconnected', 'scheduled_for_reconnection'],
    default: 'pending'
  }, 
  type:
  {
    type: String,
    enum: ['household', 'restaurant', 'establishment', 'others'],
    required: [true, 'Connection type is required']
  },
  disconnection_type: {
    type: String,
    enum: ['Voluntary', 'Non-Payment', null],
    default: null
  },
  disconnection_requested_date: {
    type: Date,
    default: null
  },
  disconnection_approved_date: {
    type: Date,
    default: null
  },
  disconnection_rejection_reason: {
    type: String,
    default: null
  },
  archive_status: {
    type: String,
    enum: ['pending_archive', 'archived', null],
    default: null
  },
  archive_reason: {
    type: String,
    default: null
  },
  archive_requested_date: {
    type: Date,
    default: null
  },
  archive_approved_date: {
    type: Date,
    default: null
  },
  archive_rejection_reason: {
    type: String,
    default: null
  },
  created_at:
  {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('WaterConnection', WaterConnectionSchema);
