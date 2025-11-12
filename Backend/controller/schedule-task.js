const ScheduleTask = require('../model/Schedule-task');
const Assignment = require('../model/Assignment');
const IncidentReports = require('../model/Incident-reports');
const WaterConnection = require('../model/WaterConnection');
const Personnel = require('../model/Personnel');

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
    description,
    schedule_type
  } = req.body;

  try {
    // ✅ AUTOMATIC SCHEDULING: Find available maintenance personnel
    let scheduleDate;
    let scheduleTime;
    let selectedPersonnel = null;
    let autoScheduledMessage = '';

    // Get all maintenance personnel
    const maintenancePersonnel = await Personnel.find({ role: 'maintenance' });

    if (maintenancePersonnel.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No maintenance personnel available. Please add maintenance personnel first.'
      });
    }

    // Define available time slots
    const timeSlots = ['09:30', '10:30', '13:30', '14:30'];

    // Calculate next business day (tomorrow)
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0, 0);

    scheduleDate = tomorrow.toISOString().split('T')[0]; // YYYY-MM-DD
    console.log(`📅 Current date: ${now.toISOString().split('T')[0]}, Schedule date: ${scheduleDate}`);

    // Try to find an available personnel for each time slot
    let foundSlot = false;
    let fallbackTime = null; // Store the time for fallback option

    for (const slot of timeSlots) {
      // Find maintenance personnel who are AVAILABLE (not already assigned) at this date and time
      const availablePersonnel = [];

      for (const personnel of maintenancePersonnel) {
        // Check if this personnel has any existing assignment at this exact date and time
        const existingAssignment = await ScheduleTask.findOne({
          assigned_personnel: personnel._id,
          schedule_time: slot
        });

        // If assignment exists, check if it's for the same date
        let isBusy = false;
        if (existingAssignment && existingAssignment.schedule_date) {
          const existingDate = new Date(existingAssignment.schedule_date);
          const targetDate = new Date(scheduleDate);

          // Compare dates (year, month, day only)
          if (existingDate.getFullYear() === targetDate.getFullYear() &&
              existingDate.getMonth() === targetDate.getMonth() &&
              existingDate.getDate() === targetDate.getDate()) {
            isBusy = true;
          }
        }

        // Only include personnel who have NO assignments at this time (conflict-free)
        if (!isBusy) {
          availablePersonnel.push(personnel);
        }
      }

      console.log(`Time slot ${slot}: ${availablePersonnel.length}/${maintenancePersonnel.length} personnel available`);

      // If ALL personnel are available for this time slot, use it (best option - no conflicts)
      if (availablePersonnel.length === maintenancePersonnel.length) {
        // Load balancing: Find the personnel with the LEAST number of tasks
        let leastBusyPersonnel = availablePersonnel[0];
        let minTaskCount = await ScheduleTask.countDocuments({ assigned_personnel: leastBusyPersonnel._id });

        for (const personnel of availablePersonnel.slice(1)) {
          const taskCount = await ScheduleTask.countDocuments({ assigned_personnel: personnel._id });
          if (taskCount < minTaskCount) {
            minTaskCount = taskCount;
            leastBusyPersonnel = personnel;
          }
        }

        selectedPersonnel = leastBusyPersonnel;
        scheduleTime = slot;
        foundSlot = true;
        console.log(`✅ Using time slot ${slot} - assigned to ${selectedPersonnel.first_name} ${selectedPersonnel.last_name} (${minTaskCount} existing tasks)`);
        break;
      }

      // If SOME personnel are available, remember this slot as a fallback
      if (availablePersonnel.length > 0 && !selectedPersonnel) {
        // Load balancing: Find the personnel with the LEAST number of tasks
        let leastBusyPersonnel = availablePersonnel[0];
        let minTaskCount = await ScheduleTask.countDocuments({ assigned_personnel: leastBusyPersonnel._id });

        for (const personnel of availablePersonnel.slice(1)) {
          const taskCount = await ScheduleTask.countDocuments({ assigned_personnel: personnel._id });
          if (taskCount < minTaskCount) {
            minTaskCount = taskCount;
            leastBusyPersonnel = personnel;
          }
        }

        selectedPersonnel = leastBusyPersonnel;
        scheduleTime = slot;
        fallbackTime = slot;
        foundSlot = true;
        console.log(`⚠️  Partial availability at ${slot} - assigned to ${selectedPersonnel.first_name} ${selectedPersonnel.last_name} (${minTaskCount} existing tasks), continuing to check for better slots...`);
        // Don't break - keep checking for a time slot where ALL personnel are free
      }
    }

    // If we found a time slot with all personnel free during the loop, we already broke
    // If we only found partial availability, selectedPersonnel and scheduleTime are already set
    // This ensures we use the earliest time slot with full availability, or fall back to partial

    // If no personnel are available at any time slot, return error
    if (!foundSlot) {
      return res.status(400).json({
        success: false,
        message: `All maintenance personnel are fully booked for ${scheduleDate}. Please try scheduling for a different date or contact admin to add more personnel.`
      });
    }

    // Create the schedule task with automatic assignment
    const newTask = await ScheduleTask.create({
      connection_id: connection_id || null,
      report_id: report_id || null,
      schedule_date: new Date(scheduleDate),
      schedule_time: scheduleTime,
      task_status: 'Assigned',
      scheduled_by: user.userId,
      description: description || '',
      assigned_personnel: selectedPersonnel._id,
      schedule_type: schedule_type
    });

    // Create assignment record
    await Assignment.create({
      task_id: newTask._id,
      assigned_to: selectedPersonnel._id,
    });

    // Update the incident report status to "Assigned" if report_id exists
    if (report_id) {
      await IncidentReports.findByIdAndUpdate(report_id, {
        reported_issue_status: 'Assigned'
      });
    }

    autoScheduledMessage = `Task automatically scheduled for ${scheduleDate} at ${scheduleTime} with ${selectedPersonnel.first_name} ${selectedPersonnel.last_name}.`;

    console.log('✅ Schedule task created with auto-assignment:', newTask._id);
    res.status(201).json({
      success: true,
      message: `Task created successfully. ${autoScheduledMessage}`,
      task: newTask,
      assigned_to: {
        _id: selectedPersonnel._id,
        name: `${selectedPersonnel.first_name} ${selectedPersonnel.last_name}`,
        role: selectedPersonnel.role
      },
      schedule_date: scheduleDate,
      schedule_time: scheduleTime
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