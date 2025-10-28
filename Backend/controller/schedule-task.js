const ScheduleTask = require('../model/Schedule-task');



const createTask = async (req, res) => {
  const user = req.user; // using user.userId
  // Validate user role - only authorized personnel can create tasks
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
  if (!schedule_date) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a schedule date'
    });
  }
  if (!schedule_time) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a schedule time'
    });
  }
  try {
    // Create new schedule task
    const newTask = await ScheduleTask.create({
      connection_id: connection_id || null,
      report_id: report_id || null,
      schedule_date: new Date(schedule_date),
      schedule_time,
      task_status: task_status || 'Unassigned',
      scheduled_by: user.userId, // ✅ Using user.userId
      description: description || '',
      assigned_to: assigned_to || null
    });
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
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'User not authenticated'
    });
  }
  if (!['meter_reader', 'admin', 'secretary', 'maintenance'].includes(user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Unauthorized access'
    });
  }
  try {
    console.log('🔍 Fetching tasks for user:', {
      userId: user.userId,
      role: user.role
    });
    let filter = {};
    // ✅ Removed task_type filtering - will filter by report type after population
    // Admin and secretary see all tasks (no filter)
    console.log('📋 Query filter:', filter);
    const tasks = await ScheduleTask.find(filter)
      .populate('connection_id', 'meter_no connection_status')
      .populate('report_id', 'type location urgency_level description')
      .populate('scheduled_by', 'first_name last_name role')
      .sort({ schedule_date: -1, createdAt: -1 })
      .lean();
    // ✅ Format tasks and extract task_type from incident report
    const formattedTasks = tasks.map(task => {
      return {
        ...task,
        task_type: task.report_id?.type || 'N/A', // ✅ Get type from incident report
      };
    });
    // ✅ Apply role-based filtering AFTER populating
    let filteredTasks = formattedTasks;
    if (user.role === 'meter_reader') {
      // Meter readers see only meter reading tasks
      filteredTasks = formattedTasks.filter(task => 
        task.task_type === 'Meter Problem' || task.assigned_to?._id?.toString() === user.userId
      );
    } else if (user.role === 'maintenance') {
      // Maintenance staff see maintenance-related tasks
      filteredTasks = formattedTasks.filter(task => 
        ['Pipe Leak', 'Damaged Infrastructure', 'Low Water Pressure', 'No Water Supply'].includes(task.task_type) || 
        task.assigned_to?._id?.toString() === user.userId
      );
    }
    console.log(`✅ Found ${filteredTasks.length} tasks (${formattedTasks.length} total before filtering)`);
    res.status(200).json({
      success: true,
      tasks: filteredTasks,
      count: filteredTasks.length
    });
  } catch (error) {
    console.error('❌ Error fetching schedule tasks:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch schedule tasks',
      error: error.message
    });
  }
};

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

  const validStatuses = ['Unassigned', 'Scheduled', 'Completed', 'Cancelled'];
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

    task.task_status = task_status;
    await task.save();

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