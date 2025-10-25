const mongoose = require('mongoose');

const AssignmentSchema = new mongoose.Schema(
  {
    task_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ScheduleTask',
      required: [true, 'Please provide the task to be assigned'],
    },
    assigned_to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Personnel',
      required: [true, 'Please specify the personnel assigned to this task'],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Assignment', AssignmentSchema);
