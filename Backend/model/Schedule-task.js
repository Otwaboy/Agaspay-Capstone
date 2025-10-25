const mongoose = require('mongoose');

const ScheduleTaskSchema = new mongoose.Schema(
  {
    connection_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WaterConnection',
      required: [true, 'Please provide a water connection'],
    },
    task_type: {
      type: String,
      enum: ['Meter Reading', 'Maintenance', 'Billing Preparation', 'Inspection', 'Other'],
      required: [true, 'Please specify the type of task'],
    },
    schedule_date: {
      type: Date,
      required: [true, 'Please provide a schedule date'],
    },
    schedule_time: {
      type: String,
      required: [true, 'Please provide a schedule time'],
    },
    task_status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Completed', 'Cancelled'],
      default: 'Pending',
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