const ScheduleTask = require('../model/Schedule-task');
const Assignment = require('../model/Assignment');
const IncidentReports = require('../model/Incident-reports');
const WaterConnection = require('../model/WaterConnection');
const Personnel = require('../model/Personnel');

/**
 * Helper function: Check and update overdue tasks
 *
 * Purpose: Automatically mark tasks as "Pending" if they are past their scheduled date/time
 * and still have status "Assigned"
 */
const checkAndUpdateOverdueTasks = async () => {
  try {
    // Get current date and time in Philippine Time (UTC+8)
    const now = new Date();
    const philippineTime = new Date(now.getTime() + (8 * 60 * 60 * 1000));

    console.log(`[Overdue Check] Current Philippine Time: ${philippineTime.toISOString()}`);

    // Find all tasks that are "Assigned" status
    const assignedTasks = await ScheduleTask.find({ task_status: 'Assigned' });

    for (const task of assignedTasks) {
      // Combine schedule_date and schedule_time to create a full datetime
      const scheduleDate = new Date(task.schedule_date);
      const [hours, minutes] = task.schedule_time.split(':');

      // Create the scheduled datetime in UTC
      const scheduledDateTime = new Date(scheduleDate);
      scheduledDateTime.setUTCHours(parseInt(hours), parseInt(minutes), 0, 0);

      // Compare: if current time is past the scheduled time, mark as Pending
      if (philippineTime > scheduledDateTime) {
        await ScheduleTask.findByIdAndUpdate(task._id, { task_status: 'Pending' });
        console.log(`[Overdue] Task ${task._id} marked as Pending (was scheduled for ${scheduledDateTime.toISOString()})`);
      }
    }
  } catch (error) {
    console.error('Error checking overdue tasks:', error);
  }
};

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
    resident_id,
    title,
    description,
    task_type,
    priority,
    schedule_type
  } = req.body;

  try {
    // ✅ Check if this is a critical incident (only critical incidents get ASAP scheduling)
    let isCritical = false;
    if (report_id) {
      const incidentReport = await IncidentReports.findById(report_id);
      if (incidentReport && incidentReport.urgency_level === 'critical') {
        isCritical = true;
        console.log('🚨 CRITICAL incident detected - prioritizing assignment');
      }
    }
    // Note: Disconnection/reconnection tasks are NOT treated as critical
    // They will be scheduled for tomorrow regardless of priority

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
    const allTimeSlots = ['09:30', '10:30', '13:30', '14:30'];

    // Calculate schedule date based on urgency (using Philippine Time UTC+8)
    const now = new Date();

    // Convert to Philippine Time by adding 8 hours to UTC
    const philippineTime = new Date(now.getTime() + (8 * 60 * 60 * 1000));
    const currentHour = philippineTime.getUTCHours();
    const currentMinute = philippineTime.getUTCMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinute;

    console.log(`🇵🇭 Philippine Time: ${philippineTime.toISOString()} (${currentHour}:${String(currentMinute).padStart(2, '0')})`);
    console.log(`📅 Philippine Date: ${philippineTime.getUTCFullYear()}-${String(philippineTime.getUTCMonth() + 1).padStart(2, '0')}-${String(philippineTime.getUTCDate()).padStart(2, '0')}`);

    let targetDate = new Date(philippineTime);
    let timeSlots = [...allTimeSlots];

    if (isCritical) {
      // Critical incidents: Schedule for TODAY if possible, otherwise tomorrow
      targetDate.setUTCHours(0, 0, 0, 0);
      console.log(`🚨 Critical incident - Current time: ${currentHour}:${String(currentMinute).padStart(2, '0')}`);

      // Filter out past time slots for today
      timeSlots = allTimeSlots.filter(slot => {
        const [slotHour, slotMinute] = slot.split(':').map(Number);
        const slotTimeInMinutes = slotHour * 60 + slotMinute;
        return slotTimeInMinutes > currentTimeInMinutes;
      });

      if (timeSlots.length === 0) {
        // All time slots for today have passed, schedule for tomorrow
        console.log('⏰ All time slots for today have passed - scheduling for tomorrow');
        targetDate.setUTCDate(philippineTime.getUTCDate() + 1);
        timeSlots = [...allTimeSlots]; // Reset to all slots for tomorrow
      } else {
        console.log(`🚨 Critical incident - attempting to schedule for TODAY in available slots: ${timeSlots.join(', ')}`);
      }
    } else {
      // Normal incidents: Schedule for tomorrow (Philippine Time)
      targetDate.setUTCDate(philippineTime.getUTCDate() + 1);
      targetDate.setUTCHours(0, 0, 0, 0);
    }

    scheduleDate = targetDate.toISOString().split('T')[0]; // YYYY-MM-DD
    console.log(`📅 Schedule date: ${scheduleDate}, Available slots: ${timeSlots.join(', ')}`);

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
        // Load balancing: Get task counts for all available personnel
        const personnelWithCounts = await Promise.all(
          availablePersonnel.map(async (personnel) => ({
            personnel,
            taskCount: await ScheduleTask.countDocuments({ assigned_personnel: personnel._id })
          }))
        );

        // Find the minimum task count
        const minTaskCount = Math.min(...personnelWithCounts.map(p => p.taskCount));

        // Get all personnel with the minimum task count (could be multiple)
        const leastBusyPersonnel = personnelWithCounts.filter(p => p.taskCount === minTaskCount);

        // If multiple personnel have the same minimum task count, pick randomly
        if (leastBusyPersonnel.length > 1) {
          const randomIndex = Math.floor(Math.random() * leastBusyPersonnel.length);
          selectedPersonnel = leastBusyPersonnel[randomIndex].personnel;
          console.log(`🎲 Multiple personnel with ${minTaskCount} tasks - randomly selected ${selectedPersonnel.first_name} ${selectedPersonnel.last_name} from ${leastBusyPersonnel.length} options`);
        } else {
          selectedPersonnel = leastBusyPersonnel[0].personnel;
          console.log(`✅ Using time slot ${slot} - assigned to ${selectedPersonnel.first_name} ${selectedPersonnel.last_name} (${minTaskCount} existing tasks)`);
        }

        scheduleTime = slot;
        foundSlot = true;
        break;
      }

      // If SOME personnel are available, remember this slot as a fallback
      if (availablePersonnel.length > 0 && !selectedPersonnel) {
        // Load balancing: Get task counts for all available personnel
        const personnelWithCounts = await Promise.all(
          availablePersonnel.map(async (personnel) => ({
            personnel,
            taskCount: await ScheduleTask.countDocuments({ assigned_personnel: personnel._id })
          }))
        );

        // Find the minimum task count
        const minTaskCount = Math.min(...personnelWithCounts.map(p => p.taskCount));

        // Get all personnel with the minimum task count (could be multiple)
        const leastBusyPersonnel = personnelWithCounts.filter(p => p.taskCount === minTaskCount);

        // If multiple personnel have the same minimum task count, pick randomly
        if (leastBusyPersonnel.length > 1) {
          const randomIndex = Math.floor(Math.random() * leastBusyPersonnel.length);
          selectedPersonnel = leastBusyPersonnel[randomIndex].personnel;
          console.log(`⚠️  Partial availability at ${slot} - randomly selected ${selectedPersonnel.first_name} ${selectedPersonnel.last_name} (${minTaskCount} tasks) from ${leastBusyPersonnel.length} options, continuing to check for better slots...`);
        } else {
          selectedPersonnel = leastBusyPersonnel[0].personnel;
          console.log(`⚠️  Partial availability at ${slot} - assigned to ${selectedPersonnel.first_name} ${selectedPersonnel.last_name} (${minTaskCount} existing tasks), continuing to check for better slots...`);
        }

        scheduleTime = slot;
        fallbackTime = slot;
        foundSlot = true;
        // Don't break - keep checking for a time slot where ALL personnel are free
      }
    }

    // If we found a time slot with all personnel free during the loop, we already broke
    // If we only found partial availability, selectedPersonnel and scheduleTime are already set
    // This ensures we use the earliest time slot with full availability, or fall back to partial

    // If no personnel are available at any time slot
    if (!foundSlot) {
      // 🚨 CRITICAL INCIDENTS: Force assignment even if all slots are full
      if (isCritical) {
        console.log('🚨 All personnel busy but incident is CRITICAL - forcing assignment to least busy personnel');

        // Get task counts for all personnel
        const personnelWithCounts = await Promise.all(
          maintenancePersonnel.map(async (personnel) => ({
            personnel,
            taskCount: await ScheduleTask.countDocuments({ assigned_personnel: personnel._id })
          }))
        );

        // Find the minimum task count
        const minTaskCount = Math.min(...personnelWithCounts.map(p => p.taskCount));

        // Get all personnel with the minimum task count
        const leastBusyPersonnel = personnelWithCounts.filter(p => p.taskCount === minTaskCount);

        // Pick randomly from least busy
        const randomIndex = Math.floor(Math.random() * leastBusyPersonnel.length);
        selectedPersonnel = leastBusyPersonnel[randomIndex].personnel;
        scheduleTime = timeSlots[0]; // Use earliest time slot

        console.log(`🚨 CRITICAL: Assigned to ${selectedPersonnel.first_name} ${selectedPersonnel.last_name} (${minTaskCount} existing tasks) at ${scheduleTime}`);
        autoScheduledMessage = `⚠️ CRITICAL incident assigned to ${selectedPersonnel.first_name} ${selectedPersonnel.last_name} for ${scheduleDate} at ${scheduleTime}. Personnel schedule is full but this is a priority.`;
      } else {
        // Normal incidents: Return error
        return res.status(400).json({
          success: false,
          message: `All maintenance personnel are fully booked for ${scheduleDate}. Please try scheduling for a different date or contact admin to add more personnel.`
        });
      }
    }

    // Create the schedule task with automatic assignment
    const newTask = await ScheduleTask.create({
      connection_id: connection_id || null,
      report_id: report_id || null,
      resident_id: resident_id || null,
      title: title || '',
      task_type: task_type || 'incident',
      priority: priority || 'medium',
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

    // Update connection status based on task type
    if (connection_id && task_type === 'disconnection') {
      const connection = await WaterConnection.findById(connection_id);
      if (connection) {
        connection.connection_status = 'scheduled_for_disconnection';
        await connection.save();
        console.log(`✅ Water connection ${connection._id} status set to scheduled_for_disconnection`);
      }
    }

    if (connection_id && task_type === 'reconnection') {
      const connection = await WaterConnection.findById(connection_id);
      if (connection) {
        connection.connection_status = 'scheduled_for_reconnection';
        await connection.save();
        console.log(`✅ Water connection ${connection._id} status set to scheduled_for_reconnection`);
      }
    }

    // Set auto-scheduled message if not already set (for critical incidents)
    if (!autoScheduledMessage) {
      if (isCritical) {
        autoScheduledMessage = `🚨 CRITICAL incident - Task prioritized and scheduled for ${scheduleDate} at ${scheduleTime} with ${selectedPersonnel.first_name} ${selectedPersonnel.last_name}.`;
      } else {
        autoScheduledMessage = `Task automatically scheduled for ${scheduleDate} at ${scheduleTime} with ${selectedPersonnel.first_name} ${selectedPersonnel.last_name}.`;
      }
    }

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
    // ✅ Check and update overdue tasks before fetching
    await checkAndUpdateOverdueTasks();

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

    // ✅ If task is a disconnection and completed, update connection status to disconnected
    if (task.task_status === 'Completed' && task.task_type === 'disconnection') {
      const connection = await WaterConnection.findById(task.connection_id);
      if (connection) {
        connection.connection_status = 'disconnected';
        await connection.save();
        console.log(`✅ Water connection ${connection._id} status set to disconnected`);
      }
    }

    // ✅ If task is a reconnection and completed, update connection status to active
    if (task.task_status === 'Completed' && task.task_type === 'reconnection') {
      const connection = await WaterConnection.findById(task.connection_id);
      if (connection) {
        connection.connection_status = 'active';
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