const mongoose = require('mongoose');

const ScheduleTaskSchema = new mongoose.Schema(
  {
    connection_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WaterConnection',
      required: false, // not all tasks come from connection
    },
    report_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'IncidentReport',
      required: false, // not all tasks come from reports 
    },
    schedule_date: {
      type: Date,
      required: [true, 'Please provide a schedule date'],
    },
    schedule_time: {
      type: String, 
      required: [true, 'Please provide a schedule time'],
    },
    schedule_type: {
      type: String,
      enum: ['Meter Installation'],
      default: 'Meter Installation',
      required: false
    },
    task_status: {
      type: String,
      enum: ['Unassigned', 'Scheduled', 'Completed', 'Cancelled', 'Pending'],
      default: 'Unassigned',  // Match the enum!
    },
    scheduled_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Personnel',
      required: [true, 'Please provide the user who scheduled the task'],
    },
  },
  { timestamps: true } 
    
);
 
module.exports = mongoose.model('ScheduleTask', ScheduleTaskSchema);