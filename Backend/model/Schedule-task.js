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
    resident_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resident',
      required: false, // for disconnection/reconnection tasks
    },
    title: {
      type: String,
      required: false, // Title for the task
    },
    task_type: {
      type: String,
      enum: ['incident', 'disconnection', 'reconnection', 'meter_installation', 'maintenance'],
      default: 'incident',
      required: false
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
      required: false
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
      enum: ['Unassigned', 'Assigned', 'Completed', 'Cancelled', 'Pending'],
      default: 'Unassigned',  // Match the enum!
    },
    scheduled_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Personnel',
      required: [true, 'Please provide the user who scheduled the task'],
    },
    assigned_personnel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Personnel',
      required: false, // Optional because tasks can be unassigned initially
    },
    description: {
      type: String,
      required: false, // Optional task description
    },
    location: {
      type: String,
      required: false, // Location for the task (e.g., resident's address)
    },
  },
  { timestamps: true }

);
 
module.exports = mongoose.model('ScheduleTask', ScheduleTaskSchema);