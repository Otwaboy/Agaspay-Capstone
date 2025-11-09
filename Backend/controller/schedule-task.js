const ScheduleTask = require('../model/Schedule-task');
const Assignment = require('../model/Assignment');
const IncidentReports = require('../model/Incident-reports');
const WaterConnection = require('../model/WaterConnection')

const createTask = async (req, res) => {
  const user = req.user;

  // Validate user role
  if (!['admin', 'secretary', 'meter_reader', 'maintenance'].includes(user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Only authorized personnel can create schedule tasks.'
    });
  }

  const {
    connection_id,
    report_id,
    schedule_date,
    schedule_time,
    task_status,
    description,
    assigned_to
  } = req.body;

  if (!schedule_date || !schedule_time) {
    return res.status(400).json({
      success: false,
      message: 'Please provide schedule date and time'
    });
  }

  try {
    // 🔹 Create the schedule task
    const newTask = await ScheduleTask.create({
      connection_id: connection_id || null,
      report_id: report_id || null,
      schedule_date: new Date(schedule_date),
      schedule_time,
      task_status: task_status || 'Unassigned',
      scheduled_by: user.userId,
      description: description || '',
      assigned_to: assigned_to || null
    });

    // 🔹 Update the incident report status to "Scheduled"
    if (report_id) {
      await IncidentReports.findByIdAndUpdate(report_id, {
        reported_issue_status: 'Assigned'
      });
    }

    console.log('✅ Schedule task created:', newTask._id);
    res.status(201).json({
      success: true,
      message: 'Schedule task created successfully',
      task: newTask
    });
 
  } catch (error) {
    console.error('❌ Error creating schedule task:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create schedule task',
      error: error.message
    });
  }
};




// Get all schedule tasks (with filtering based on user role)
const getTasks = async (req, res) => {
  const user = req.user;

  // 🔒 Check authentication
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'User not authenticated',
    });
  }

  // 🔒 Role check
  if (!['admin', 'secretary', 'maintenance'].includes(user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Unauthorized access',
    });
  }

  try {
    console.log('🔍 Fetching tasks for user:', { userId: user.userId, role: user.role });

    const now = new Date();

    // 🔹 Step 1: Fetch all tasks that are still "Scheduled"
    const schedTasks = await ScheduleTask.find({
      task_status: { $nin: ['Pending', 'Completed'] },
    })
      .populate('report_id', 'schedule_date schedule_time')
      .lean();

    // 🔹 Step 2: Check if the schedule date+time has passed
    const updates = [];
    for (const task of schedTasks) {
      if (!task.report_id?.schedule_date || !task.report_id?.schedule_time) continue;

      const scheduleDate = new Date(task.report_id.schedule_date);
      const timeStr = task.report_id.schedule_time.trim();

      // Parse time (support formats like "11:30 AM" or "14:00")
      let [time, modifier] = timeStr.split(' ');
      let [hours, minutes] = time.split(':').map(Number);
      if (modifier?.toLowerCase() === 'pm' && hours < 12) hours += 12;
      if (modifier?.toLowerCase() === 'am' && hours === 12) hours = 0;

      scheduleDate.setHours(hours, minutes || 0, 0, 0);

      // Compare current time vs schedule
      if (scheduleDate < now) {
        updates.push(task._id);
      }
    }

    // 🔹 Step 3: Update overdue ones in bulk
    if (updates.length > 0) {
      await ScheduleTask.updateMany(
        { _id: { $in: updates } },
        { $set: { task_status: 'Pending' } }
      );
      console.log(`🕒 Updated ${updates.length} tasks to Pending (overdue)`);
    }

    // 🔹 Step 4: Fetch all tasks again after updates
    const tasks = await ScheduleTask.find({})
      .populate('connection_id', 'meter_no connection_status')
      .populate('report_id', 'type location urgency_level description schedule_time schedule_date')
      .populate('scheduled_by', 'first_name last_name role')
      .sort({ schedule_date: -1, createdAt: -1 })
      .lean();

    // 🔹 Step 5: Fetch all assignments 
    const allAssignments = await Assignment.find({})
      .populate('assigned_to', 'first_name last_name role')
      .lean();

    // 🔹 Step 6: Attach assignment info
    const formattedTasks = tasks.map((task) => {
      const assignment = allAssignments.find(
        (a) => a.task_id.toString() === task._id.toString()
      );

      return {
        ...task,
        task_type: task.report_id?.type || 'N/A',
         schedule_type: task.schedule_type || 'N/A', // ✅ Include schedule_type here
        assigned_to: assignment?.assigned_to
          ? {
              _id: assignment.assigned_to._id,
              name: `${assignment.assigned_to.first_name} ${assignment.assigned_to.last_name}`,
              role: assignment.assigned_to.role,
            }
          : null,
      };
    });

    // 🔹 Step 7: Role-based filtering
    let filteredTasks = formattedTasks;
    if (user.role === 'maintenance') {
      filteredTasks = formattedTasks.filter(
        (task) =>
          [
            'Pipe Leak',
            'Damaged Infrastructure',
            'Low Water Pressure',
            'No Water Supply',
          ].includes(task.task_type) ||
          task.assigned_to?._id?.toString() === user.userId
      );
    }

    console.log(`✅ Found ${filteredTasks.length} tasks (${formattedTasks.length} total before filtering)`);

    res.status(200).json({
      success: true,
      tasks: filteredTasks,
      count: filteredTasks.length,
    });
  } catch (error) {
    console.error('❌ Error fetching schedule tasks:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch schedule tasks',
      error: error.message,
    });
  }
};

 



// Update task status
// Update task status
const updateTaskStatus = async (req, res) => {
  const user = req.user;
  const { taskId } = req.params;
  const { task_status } = req.body;

  if (!['admin', 'secretary', 'meter_reader', 'maintenance'].includes(user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Unauthorized to update task status'
    });
  }

  const validStatuses = ['Unassigned', 'Assigned', 'Completed', 'Cancelled', 'Pending'];
  if (!validStatuses.includes(task_status)) {
    return res.status(400).json({
      success: false,
      message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
    });
  }

  try {
    const task = await ScheduleTask.findById(taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // ✅ Update task status
    task.task_status = task_status;
    await task.save();

    // ✅ If task is a meter installation and completed, update resident's water connection status
    if (task.task_status === 'Completed' && task.schedule_type === 'Meter Installation') {
      // Fetch the water connection linked to this task
      const connection = await WaterConnection.findById(task.connection_id);
      if (connection) {
        connection.connection_status ='active';
        await connection.save();
        console.log(`✅ Water connection ${connection._id} status set to active`);
      }
    }

    // ✅ If task is linked to an incident report, update report status
    if (task.report_id && task_status === 'Completed') {
      await IncidentReports.findByIdAndUpdate(task.report_id, {
        reported_issue_status: 'Completed',
        date_handled: new Date()
      });
      console.log(`✅ Incident report ${task.report_id} marked as Completed`);
    }

    console.log('✅ Task status updated:', taskId);

    res.status(200).json({
      success: true,
      message: 'Task status updated successfully',
      task
    });

  } catch (error) {
    console.error('❌ Error updating task status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update task status',
      error: error.message
    });
  }
};



// Delete task
const deleteTask = async (req, res) => {
  const user = req.user;
  const { taskId } = req.params;

  if (!['admin', 'secretary'].includes(user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Only admin and secretary can delete tasks'
    });
  }

  try {
    const task = await ScheduleTask.findByIdAndDelete(taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    console.log('✅ Task deleted:', taskId);

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error deleting task:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete task',
      error: error.message
    });
  }
};

module.exports = {
  createTask,
  getTasks,
  updateTaskStatus,
  deleteTask
};