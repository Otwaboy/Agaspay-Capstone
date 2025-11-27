const mongoose = require('mongoose');
  
const IncidentReportSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: [true, 'Please specify the type of incident'],
      enum: ['No Water Supply', 'Low Water Pressure', 'Pipe Leak', 'Water Quality Issue', 'Meter Problem', 'Damaged Infrastructure', 'Other', 'Meter Issue'],
    },
    location: {
      type: String,
      default: null,
    },
    urgency_level:{
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
    },
    description: {
      type: String,
      required: [true, 'Please provide a short description or remarks'],
    },
    reported_issue_status: {
      type: String,
      enum: ['Pending','Completed', 'Scheduled','Cancelled', 'In Progress', 'Resolved', 'Closed'],
      default: 'Pending',
    },
    reported_at: {
      type: Date,
      default: Date.now,
    },
    date_handled: {
      type: Date,
    },
   reported_by: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'reported_by_model',
        required: [true, 'Please specify who reported the issue'],
    },
    reported_by_model: {
    type: String,
    required: true,
    enum: ['Resident', 'Personnel'],
    },
    connection_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WaterConnection',
      default: null
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('IncidentReport', IncidentReportSchema);
